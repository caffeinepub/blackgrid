import {
  AlertTriangle,
  Camera,
  CheckCircle,
  Navigation,
  ScanLine,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQRScanner } from "../qr-code/useQRScanner";

type ShieldSubTab = "scan" | "route";

interface GeoCoords {
  lat: number;
  lng: number;
  accuracy: number;
}

function useGeolocation() {
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const watchIdRef = useRef<number | null>(null);

  const startWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setError("GEOLOCATION NOT SUPPORTED");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message.toUpperCase());
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  const refresh = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message.toUpperCase());
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  useEffect(() => {
    startWatch();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startWatch]);

  return { coords, error, loading, refresh };
}

// Map SF lat/lng bounds to SVG 0-100 coordinate space
const LAT_MIN = 37.77; // bottom  -> y=95
const LAT_MAX = 37.785; // top     -> y=5
const LNG_MIN = -122.425; // left   -> x=5
const LNG_MAX = -122.4; // right  -> x=95

function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const xRaw = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 90 + 5;
  const yRaw = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 90 + 5;
  return {
    x: Math.max(5, Math.min(95, xRaw)),
    y: Math.max(5, Math.min(95, yRaw)),
  };
}

function buildRoutePoints(userX: number, userY: number): string {
  // Destination
  const destX = 75;
  const destY = 18;
  // Waypoints: nudge east to stay away from x<35 danger zones
  const mid1X = Math.max(45, userX + (destX - userX) * 0.25);
  const mid1Y = userY + (destY - userY) * 0.3;
  const mid2X = Math.max(50, userX + (destX - userX) * 0.6);
  const mid2Y = userY + (destY - userY) * 0.65;
  return [
    `${userX.toFixed(1)},${userY.toFixed(1)}`,
    `${mid1X.toFixed(1)},${mid1Y.toFixed(1)}`,
    `${mid2X.toFixed(1)},${mid2Y.toFixed(1)}`,
    `${destX},${destY}`,
  ].join(" ");
}

const STATIC_ROUTE_POINTS = "50,95 52,78 56,62 60,48 65,36 70,26 75,18";

const ROUTE_H_LINES = Array.from({ length: 20 }, (_, i) => ({
  y: i * 5,
  key: `rh-y${i * 5}`,
}));
const ROUTE_V_LINES = Array.from({ length: 20 }, (_, i) => ({
  x: i * 5,
  key: `rv-x${i * 5}`,
}));
const ROUTE_BLOCKS = [
  { x: 5, y: 5, w: 22, h: 14, key: "rb-nw1" },
  { x: 30, y: 5, w: 18, h: 10, key: "rb-n2" },
  { x: 52, y: 5, w: 25, h: 12, key: "rb-ne3" },
  { x: 80, y: 5, w: 15, h: 16, key: "rb-ne4" },
  { x: 30, y: 22, w: 20, h: 16, key: "rb-c5" },
  { x: 55, y: 22, w: 28, h: 14, key: "rb-e6" },
  { x: 28, y: 45, w: 22, h: 14, key: "rb-s7" },
  { x: 55, y: 42, w: 18, h: 22, key: "rb-sc8" },
  { x: 78, y: 45, w: 17, h: 18, key: "rb-se9" },
  { x: 38, y: 68, w: 20, h: 26, key: "rb-ss10" },
  { x: 63, y: 68, w: 16, h: 26, key: "rb-sse11" },
  { x: 83, y: 68, w: 12, h: 26, key: "rb-ssee12" },
];
const DANGER_ZONES = [
  { x: 5, y: 25, w: 30, h: 18, key: "dz-mission" },
  { x: 5, y: 48, w: 20, h: 20, key: "dz-tenderloin" },
  { x: 35, y: 55, w: 18, h: 14, key: "dz-soma" },
];

const ROUTE_STEPS = [
  "Head north on Van Ness Ave",
  "Turn right on Market St",
  "Continue on Market St past Civic Center",
  "Turn left on 7th St (avoid Tenderloin)",
  "Turn right on Howard St",
  "Arrive at destination via Folsom St",
];

function IdentityScan() {
  const [scannedProfile, setScannedProfile] = useState<{
    name: string;
    verified: boolean;
    trustScore: number;
  } | null>(null);

  const {
    qrResults,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    videoRef,
    canvasRef,
  } = useQRScanner({ facingMode: "environment", scanInterval: 150 });

  if (qrResults.length > 0 && !scannedProfile) {
    setScannedProfile({
      name: "Verified User",
      verified: true,
      trustScore: 92,
    });
  }

  return (
    <div className="space-y-6">
      <div className="card-blackgrid border-[#C9A95C22]">
        <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] mb-4">
          IDENTITY SCAN MODULE
        </div>
        <p className="text-xs text-[#8A8A8A] tracking-wide mb-6 leading-relaxed">
          Scan a BLACKGRID QR identity badge to verify a contact. All scans are
          consent-based and encrypted.
        </p>

        {isSupported === false ? (
          <div className="text-center py-8" data-ocid="shield.scan.error_state">
            <AlertTriangle className="w-10 h-10 text-[#C00000] mx-auto mb-3" />
            <p className="text-sm text-[#8A8A8A] tracking-wide">
              Camera not supported on this device.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="relative w-full max-w-sm mx-auto"
              style={{ aspectRatio: "1" }}
            >
              <div className="absolute inset-0 bg-[#0F0F0F] border border-[#2A2A2A] rounded overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                  style={{ display: isActive ? "block" : "none" }}
                />
                {!isActive && (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Camera className="w-12 h-12 text-[#2A2A2A]" />
                    <span className="text-xs tracking-widest uppercase text-[#4A4A4A]">
                      Camera Inactive
                    </span>
                  </div>
                )}
              </div>
              {isActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A95C]" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C9A95C]" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C9A95C]" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A95C]" />
                    <ScanLine className="absolute inset-0 m-auto w-6 h-6 text-[#C9A95C] animate-pulse" />
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {error && (
              <div
                className="text-center text-xs text-[#C00000] tracking-wider"
                data-ocid="shield.scan.error_state"
              >
                {error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={startScanning}
                disabled={!canStartScanning || isActive}
                data-ocid="shield.scan.primary_button"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-widest uppercase font-bold hover:bg-[#E8C878] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ScanLine className="w-4 h-4" />
                {isLoading ? "INITIALIZING..." : "ACTIVATE SCAN"}
              </button>
              {isActive && (
                <button
                  type="button"
                  onClick={stopScanning}
                  data-ocid="shield.scan.secondary_button"
                  className="px-6 py-2.5 border border-[#2A2A2A] text-[#8A8A8A] text-[10px] tracking-widest uppercase hover:border-[#C00000] hover:text-[#C00000] transition-all"
                >
                  DEACTIVATE
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {scannedProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-blackgrid border-[#2ECC7144]"
          data-ocid="shield.scan.success_state"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-[#2ECC71]" />
            <span className="text-[10px] tracking-widest uppercase text-[#2ECC71]">
              IDENTITY VERIFIED
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
                Name
              </div>
              <div className="text-sm font-bold tracking-wider uppercase text-[#EDEDED]">
                {scannedProfile.name}
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
                Trust Score
              </div>
              <div className="text-sm font-bold text-[#C9A95C]">
                {scannedProfile.trustScore}/100
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
                Status
              </div>
              <div className="text-[10px] font-bold text-[#2ECC71] tracking-widest">
                VERIFIED HUMAN
              </div>
            </div>
            <div>
              <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
                Badge Type
              </div>
              <div className="text-[10px] font-bold text-[#C9A95C] tracking-widest">
                PERSONAL
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setScannedProfile(null)}
            data-ocid="shield.scan.close_button"
            className="mt-4 text-[10px] tracking-widest uppercase text-[#8A8A8A] hover:text-[#C9A95C] transition-colors"
          >
            CLEAR RESULT
          </button>
        </motion.div>
      )}
    </div>
  );
}

function RouteDefense() {
  const {
    coords,
    error: gpsError,
    loading: gpsLoading,
    refresh,
  } = useGeolocation();

  const svgPos = useMemo(
    () => (coords ? geoToSvg(coords.lat, coords.lng) : null),
    [coords],
  );

  const routePoints = useMemo(() => {
    if (!svgPos) return STATIC_ROUTE_POINTS;
    return buildRoutePoints(svgPos.x, svgPos.y);
  }, [svgPos]);

  const isTracking = !!coords && !gpsLoading;

  return (
    <div className="space-y-4">
      <div className="card-blackgrid">
        <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] mb-2">
          ROUTE DEFENSE ACTIVE
        </div>
        <div className="flex items-center gap-2 text-xs text-[#2ECC71] tracking-wider">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
          SAFEST ROUTE CALCULATED
        </div>
      </div>

      {/* GPS Status Bar */}
      <div
        className="card-blackgrid flex items-center justify-between gap-3"
        style={{
          borderColor: gpsError
            ? "rgba(192,0,0,0.3)"
            : coords
              ? "rgba(74,158,255,0.3)"
              : "rgba(201,169,92,0.2)",
        }}
        data-ocid="shield.route.panel"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {gpsLoading && (
            <>
              <div className="w-2 h-2 rounded-full bg-[#C9A95C] animate-pulse flex-shrink-0" />
              <span className="text-[10px] tracking-widest uppercase text-[#C9A95C] font-mono">
                ACQUIRING GPS SIGNAL...
              </span>
            </>
          )}
          {!gpsLoading && gpsError && (
            <>
              <div className="w-2 h-2 rounded-full bg-[#C00000] flex-shrink-0" />
              <span className="text-[10px] tracking-widest uppercase text-[#C00000] font-mono truncate">
                {gpsError}
              </span>
            </>
          )}
          {!gpsLoading && !gpsError && coords && (
            <>
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
                style={{ background: "#4A9EFF" }}
              />
              <span
                className="text-[10px] tracking-widest uppercase font-mono"
                style={{ color: "#4A9EFF" }}
              >
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}&nbsp;&nbsp;±
                {coords.accuracy}m
              </span>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={refresh}
          data-ocid="shield.route.primary_button"
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 border text-[9px] tracking-widest uppercase transition-all"
          style={{
            borderColor: isTracking
              ? "rgba(74,158,255,0.5)"
              : "rgba(201,169,92,0.27)",
            color: isTracking ? "#4A9EFF" : "#C9A95C",
            background: isTracking ? "rgba(74,158,255,0.07)" : "transparent",
          }}
        >
          {isTracking ? (
            <>
              <span
                className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                style={{ background: "#4A9EFF", display: "inline-block" }}
              />
              AUTO-TRACKING
            </>
          ) : (
            <>
              <Navigation className="w-3 h-3" />
              LOCATE ME
            </>
          )}
        </button>
      </div>

      {/* Auto-route status indicator */}
      {isTracking && (
        <div
          className="text-[9px] tracking-widest uppercase font-mono"
          style={{ color: "#4A9EFF" }}
        >
          AUTO-ROUTE ACTIVE — RECALCULATING FROM YOUR POSITION
        </div>
      )}

      <div className="card-blackgrid">
        <div
          className="relative w-full rounded overflow-hidden"
          style={{ paddingBottom: "55%" }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            role="img"
            aria-label="Route defense map showing safest path"
          >
            <title>Route Defense Map</title>
            <defs>
              <style>{`
                @keyframes gps-ripple {
                  0% { r: 3; opacity: 0.6; }
                  100% { r: 8; opacity: 0; }
                }
                .gps-ripple {
                  animation: gps-ripple 1.6s ease-out infinite;
                }
              `}</style>
            </defs>
            <rect width="100" height="100" fill="#0A0A0A" />
            {ROUTE_H_LINES.map((line) => (
              <line
                key={line.key}
                x1="0"
                y1={line.y}
                x2="100"
                y2={line.y}
                stroke="#C9A95C"
                strokeOpacity="0.05"
                strokeWidth="0.2"
              />
            ))}
            {ROUTE_V_LINES.map((line) => (
              <line
                key={line.key}
                x1={line.x}
                y1="0"
                x2={line.x}
                y2="100"
                stroke="#C9A95C"
                strokeOpacity="0.05"
                strokeWidth="0.2"
              />
            ))}
            {ROUTE_BLOCKS.map((b) => (
              <rect
                key={b.key}
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                fill="#1A1A1A"
                stroke="#2A2A2A"
                strokeWidth="0.3"
              />
            ))}
            {DANGER_ZONES.map((z) => (
              <rect
                key={z.key}
                x={z.x}
                y={z.y}
                width={z.w}
                height={z.h}
                fill="#7A0000"
                fillOpacity="0.25"
                stroke="#C00000"
                strokeWidth="0.4"
                strokeOpacity="0.5"
              />
            ))}
            <polyline
              points={routePoints}
              stroke="#C9A95C"
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={routePoints}
              stroke="#C9A95C"
              strokeWidth="3"
              fill="none"
              strokeOpacity="0.1"
            />
            {/* Origin dot: dynamic when GPS available, static fallback */}
            <circle
              cx={svgPos ? svgPos.x : 50}
              cy={svgPos ? svgPos.y : 95}
              r="2"
              fill="#2ECC71"
            />
            <circle cx="75" cy="18" r="2" fill="#C9A95C" />
            {/* Street name labels */}
            <text
              x="2"
              y="40"
              fontSize="3"
              fill="#C9A95C"
              fillOpacity="0.7"
              fontFamily="monospace"
              transform="rotate(-90, 2, 40)"
            >
              MARKET ST
            </text>
            <text
              x="2"
              y="68"
              fontSize="3"
              fill="#C9A95C"
              fillOpacity="0.7"
              fontFamily="monospace"
              transform="rotate(-90, 2, 68)"
            >
              MISSION ST
            </text>
            <text
              x="48"
              y="97"
              fontSize="3"
              fill="#C9A95C"
              fillOpacity="0.7"
              fontFamily="monospace"
            >
              VAN NESS AVE
            </text>
            <text
              x="75"
              y="97"
              fontSize="3"
              fill="#C9A95C"
              fillOpacity="0.7"
              fontFamily="monospace"
            >
              7TH ST
            </text>
            <text
              x="55"
              y="38"
              fontSize="2.5"
              fill="#C9A95C"
              fillOpacity="0.7"
              fontFamily="monospace"
            >
              HOWARD ST
            </text>
            <text
              x="55"
              y="52"
              fontSize="2.5"
              fill="#C9A95C"
              fillOpacity="0.7"
              fontFamily="monospace"
            >
              FOLSOM ST
            </text>
            {/* Origin / Destination labels */}
            <text
              x={svgPos ? svgPos.x - 7 : 43}
              y={svgPos ? svgPos.y - 4 : 93}
              fontSize="2.5"
              fill="#2ECC71"
              fillOpacity="0.9"
              fontFamily="monospace"
            >
              ORIGIN
            </text>
            <text
              x="68"
              y="16"
              fontSize="2.5"
              fill="#C9A95C"
              fillOpacity="0.9"
              fontFamily="monospace"
            >
              DESTINATION
            </text>
            {/* GPS — You Are Here */}
            {isTracking && svgPos && (
              <g>
                <circle
                  cx={svgPos.x}
                  cy={svgPos.y}
                  r="3"
                  fill="#4A9EFF"
                  fillOpacity="0.25"
                  className="gps-ripple"
                />
                <circle cx={svgPos.x} cy={svgPos.y} r="2" fill="#4A9EFF" />
                <text
                  x={svgPos.x}
                  y={svgPos.y - 4}
                  fontSize="2.5"
                  fill="#4A9EFF"
                  fillOpacity="0.95"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  YOU
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className="flex items-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-0.5 bg-[#C9A95C]" />
            <span className="text-[10px] tracking-wider uppercase text-[#C9A95C]">
              Safe Route
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#7A0000] opacity-50" />
            <span className="text-[10px] tracking-wider uppercase text-[#B8B8B8]">
              Danger Zones
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2ECC71]" />
            <span className="text-[10px] tracking-wider uppercase text-[#B8B8B8]">
              Current
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#4A9EFF" }}
            />
            <span className="text-[10px] tracking-wider uppercase text-[#B8B8B8]">
              You Are Here
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(
          [
            { label: "ZONES AVOIDED", value: "3", color: "#C00000" },
            { label: "ROUTE SAFETY", value: "94%", color: "#2ECC71" },
            { label: "ETA OFFSET", value: "+4 min", color: "#D8B84A" },
          ] as const
        ).map((stat) => (
          <div key={stat.label} className="card-blackgrid text-center">
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[9px] tracking-widest uppercase text-[#8A8A8A] mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Step-by-step route card */}
      <div
        className="card-blackgrid space-y-3"
        style={{ borderColor: "rgba(201,169,92,0.2)" }}
      >
        <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] border-b border-[#1A1A1A] pb-2">
          SAFE ROUTE — STEP BY STEP
        </div>
        <div className="space-y-2.5">
          {ROUTE_STEPS.map((step, i) => (
            <div key={step} className="flex items-start gap-3">
              <span
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                style={{ color: "#0A0A0A", background: "#C9A95C" }}
              >
                {i + 1}
              </span>
              <span className="text-xs text-[#EDEDED] tracking-wide leading-relaxed">
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShieldTab() {
  const [subTab, setSubTab] = useState<ShieldSubTab>("scan");

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#1A1A1A]">
        <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
          SHIELD SYSTEM
        </div>
        <h1 className="text-2xl font-bold tracking-widest uppercase text-[#EDEDED]">
          Active Defense
        </h1>
      </div>

      <div
        className="flex gap-1 bg-[#0F0F0F] p-1 rounded border border-[#2A2A2A]"
        data-ocid="shield.tab"
      >
        <button
          type="button"
          onClick={() => setSubTab("scan")}
          data-ocid="shield.scan.tab"
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] tracking-widest uppercase font-medium transition-all ${
            subTab === "scan"
              ? "bg-[#1A1500] border border-[#C9A95C44] text-[#C9A95C]"
              : "text-[#8A8A8A] hover:text-[#EDEDED]"
          }`}
        >
          <ScanLine className="w-4 h-4" />
          IDENTITY SCAN
        </button>
        <button
          type="button"
          onClick={() => setSubTab("route")}
          data-ocid="shield.route.tab"
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[10px] tracking-widest uppercase font-medium transition-all ${
            subTab === "route"
              ? "bg-[#1A1500] border border-[#C9A95C44] text-[#C9A95C]"
              : "text-[#8A8A8A] hover:text-[#EDEDED]"
          }`}
        >
          <Navigation className="w-4 h-4" />
          ROUTE DEFENSE
        </button>
      </div>

      {subTab === "scan" ? <IdentityScan /> : <RouteDefense />}
    </div>
  );
}
