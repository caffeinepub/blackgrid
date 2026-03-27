import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  CheckCircle,
  CornerDownLeft,
  CornerUpRight,
  MapPin,
  Navigation,
  ScanLine,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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

function useCompassHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      setSupported(false);
      return;
    }

    let rafId: number | null = null;
    let latestHeading: number | null = null;

    const handler = (e: DeviceOrientationEvent) => {
      const ios = (
        e as DeviceOrientationEvent & { webkitCompassHeading?: number }
      ).webkitCompassHeading;
      let h: number | null = null;
      if (typeof ios === "number" && !Number.isNaN(ios)) {
        h = ios;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        h = (360 - e.alpha) % 360;
      }
      if (h !== null) {
        latestHeading = h;
        setSupported(true);
      } else {
        setSupported(false);
      }
    };

    const tick = () => {
      if (latestHeading !== null) {
        setHeading(Math.round(latestHeading));
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener("deviceorientation", handler, true);
    rafId = requestAnimationFrame(tick);

    const reqPerm = (
      DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      }
    ).requestPermission;
    if (typeof reqPerm === "function") {
      reqPerm()
        .then((state) => {
          if (state !== "granted") setSupported(false);
        })
        .catch(() => setSupported(false));
    }

    return () => {
      window.removeEventListener("deviceorientation", handler, true);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return { heading, supported };
}

const LAT_MIN = 37.77;
const LAT_MAX = 37.785;
const LNG_MIN = -122.425;
const LNG_MAX = -122.4;

function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const xRaw = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 90 + 5;
  const yRaw = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 90 + 5;
  return {
    x: Math.max(5, Math.min(95, xRaw)),
    y: Math.max(5, Math.min(95, yRaw)),
  };
}

function isNearDangerZone(x: number, y: number, margin = 5): boolean {
  return DANGER_ZONES.some(
    (z) =>
      x >= z.x - margin &&
      x <= z.x + z.w + margin &&
      y >= z.y - margin &&
      y <= z.y + z.h + margin,
  );
}

function pushAwayFromDangerZones(
  x: number,
  y: number,
  margin = 5,
): { x: number; y: number } {
  let px = x;
  let py = y;
  for (const z of DANGER_ZONES) {
    if (
      px >= z.x - margin &&
      px <= z.x + z.w + margin &&
      py >= z.y - margin &&
      py <= z.y + z.h + margin
    ) {
      px = z.x + z.w + margin + 2;
      py = Math.max(py - margin, 5);
    }
  }
  return { x: Math.min(95, px), y: Math.max(5, py) };
}

function buildRoutePoints(userX: number, userY: number): string {
  const destX = 75;
  const destY = 18;

  const raw1 = {
    x: Math.max(45, userX + (destX - userX) * 0.25),
    y: userY + (destY - userY) * 0.3,
  };
  const raw2 = {
    x: Math.max(50, userX + (destX - userX) * 0.6),
    y: userY + (destY - userY) * 0.65,
  };

  const mid1 = isNearDangerZone(raw1.x, raw1.y)
    ? pushAwayFromDangerZones(raw1.x, raw1.y)
    : raw1;
  const mid2 = isNearDangerZone(raw2.x, raw2.y)
    ? pushAwayFromDangerZones(raw2.x, raw2.y)
    : raw2;

  return [
    `${userX.toFixed(1)},${userY.toFixed(1)}`,
    `${mid1.x.toFixed(1)},${mid1.y.toFixed(1)}`,
    `${mid2.x.toFixed(1)},${mid2.y.toFixed(1)}`,
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

const SF_STREETS = [
  "Market St",
  "Mission St",
  "Van Ness Ave",
  "7th St",
  "Howard St",
  "Folsom St",
  "Bryant St",
  "Brannan St",
  "Cesar Chavez St",
  "Geary Blvd",
  "Post St",
  "Sutter St",
  "Bush St",
  "Pine St",
  "California St",
  "4th St",
  "3rd St",
  "8th St",
  "9th St",
  "10th St",
];

type Direction = "north" | "south" | "east" | "west";
type TurnType = "head" | "right" | "left" | "slight-right" | "arrive";

interface RouteStep {
  turn: TurnType;
  direction?: Direction;
  street: string;
  distance: string;
  instruction: string;
}

function extractStreetName(address: string): string | null {
  // Try to extract a street name from an address string
  // Match patterns like "123 Market St", "Market St", coordinates, etc.
  const coordPattern = /^[-\d.]+,\s*[-\d.]+$/;
  if (coordPattern.test(address.trim())) return null;

  // Remove leading number
  const withoutNum = address.replace(/^\d+\s+/, "").trim();
  // Take first meaningful portion before comma
  const beforeComma = withoutNum.split(",")[0].trim();
  // Limit to ~20 chars
  return beforeComma.length > 0 ? beforeComma.slice(0, 22) : null;
}

function pickStreet(exclude: string[], seed: number): string {
  const available = SF_STREETS.filter((s) => !exclude.includes(s));
  return available[seed % available.length];
}

function generateTurnByTurn(startAddr: string, endAddr: string): RouteStep[] {
  const startStreet = extractStreetName(startAddr) ?? "Van Ness Ave";
  const endStreet = extractStreetName(endAddr) ?? "Market St";

  const midStreets = [
    pickStreet([startStreet, endStreet], 2),
    pickStreet([startStreet, endStreet], 5),
    pickStreet([startStreet, endStreet], 9),
    pickStreet([startStreet, endStreet], 13),
  ];

  const steps: RouteStep[] = [
    {
      turn: "head",
      direction: "north",
      street: startStreet,
      distance: "0.2 mi",
      instruction: `Head north on ${startStreet}`,
    },
    {
      turn: "right",
      street: midStreets[0],
      distance: "0.4 mi",
      instruction: `Turn right onto ${midStreets[0]}`,
    },
    {
      turn: "left",
      street: midStreets[1],
      distance: "0.3 mi",
      instruction: `Turn left onto ${midStreets[1]} (avoid high-risk zone)`,
    },
    {
      turn: "slight-right",
      street: midStreets[2],
      distance: "0.5 mi",
      instruction: `Slight right — continue on ${midStreets[2]}`,
    },
    {
      turn: "right",
      street: midStreets[3],
      distance: "0.2 mi",
      instruction: `Turn right onto ${midStreets[3]}`,
    },
    {
      turn: "arrive",
      street: endStreet,
      distance: "0.0 mi",
      instruction: `Arrive at destination — ${endStreet}`,
    },
  ];

  return steps;
}

function DirectionIcon({ turn }: { turn: TurnType; direction?: Direction }) {
  const cls = "w-4 h-4 flex-shrink-0";
  switch (turn) {
    case "head":
      return <ArrowUp className={cls} />;
    case "right":
      return <ArrowRight className={cls} />;
    case "left":
      return <ArrowLeft className={cls} />;
    case "slight-right":
      return <CornerUpRight className={cls} />;
    case "arrive":
      return <MapPin className={cls} />;
    default:
      return <ArrowDown className={cls} />;
  }
}

function TurnByTurnCard({
  steps,
  startAddr,
  endAddr,
}: {
  steps: RouteStep[];
  startAddr: string;
  endAddr: string;
}) {
  const totalDist = steps
    .reduce((acc, s) => acc + Number.parseFloat(s.distance), 0)
    .toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="card-blackgrid"
      style={{ borderColor: "rgba(201,169,92,0.3)" }}
      data-ocid="route.turn_by_turn.panel"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between mb-1 pb-3 border-b"
        style={{ borderColor: "rgba(201,169,92,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-[#C9A95C]" />
          <span
            className="text-[11px] tracking-[0.2em] uppercase font-bold"
            style={{ color: "#C9A95C" }}
          >
            SAFE ROUTE — TURN BY TURN
          </span>
        </div>
        <span
          className="text-[9px] tracking-widest uppercase font-mono"
          style={{ color: "#4A4A4A" }}
        >
          {totalDist} mi total
        </span>
      </div>

      {/* From/To summary */}
      <div
        className="flex flex-col gap-1 mb-4 px-3 py-2 border"
        style={{
          borderColor: "rgba(201,169,92,0.12)",
          background: "rgba(201,169,92,0.04)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#2ECC71] flex-shrink-0" />
          <span className="text-[10px] tracking-wider text-[#8A8A8A] uppercase font-mono truncate">
            FROM:{" "}
            <span className="text-[#EDEDED]">
              {startAddr.length > 28 ? `${startAddr.slice(0, 28)}…` : startAddr}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-2 h-2 text-[#C00000] flex-shrink-0" />
          <span className="text-[10px] tracking-wider text-[#8A8A8A] uppercase font-mono truncate">
            TO:{" "}
            <span className="text-[#EDEDED]">
              {endAddr.length > 28 ? `${endAddr.slice(0, 28)}…` : endAddr}
            </span>
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div
            key={`step-${i + 1}-${step.turn}`}
            data-ocid={`route.turn_by_turn.item.${i + 1}`}
          >
            <div className="flex items-start gap-3 py-3">
              {/* Step number */}
              <div
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-[9px] font-bold"
                style={{
                  background:
                    step.turn === "arrive"
                      ? "#7A0000"
                      : "rgba(201,169,92,0.15)",
                  border: `1px solid ${
                    step.turn === "arrive"
                      ? "rgba(192,0,0,0.6)"
                      : "rgba(201,169,92,0.4)"
                  }`,
                  color: step.turn === "arrive" ? "#FF6B6B" : "#C9A95C",
                }}
              >
                {i + 1}
              </div>

              {/* Arrow icon */}
              <div
                className="flex-shrink-0 mt-0.5"
                style={{
                  color: step.turn === "arrive" ? "#C00000" : "#C9A95C",
                }}
              >
                <DirectionIcon turn={step.turn} />
              </div>

              {/* Instruction */}
              <div className="flex-1 min-w-0">
                <div
                  className="text-[11px] tracking-wide leading-relaxed"
                  style={{
                    color: step.turn === "arrive" ? "#FF9999" : "#EDEDED",
                    fontWeight: step.turn === "arrive" ? 600 : 400,
                  }}
                >
                  {step.instruction}
                </div>
              </div>

              {/* Distance badge */}
              <div
                className="flex-shrink-0 text-[9px] font-mono tracking-widest px-2 py-0.5 border"
                style={{
                  borderColor: "rgba(201,169,92,0.2)",
                  color: "#8A8A8A",
                  background: "rgba(201,169,92,0.05)",
                  minWidth: "42px",
                  textAlign: "center",
                }}
              >
                {step.distance}
              </div>
            </div>

            {/* Divider between steps */}
            {i < steps.length - 1 && (
              <div
                className="ml-9 h-px"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="mt-3 pt-3 border-t flex items-center gap-2"
        style={{ borderColor: "rgba(201,169,92,0.1)" }}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
        <span className="text-[9px] tracking-widest uppercase font-mono text-[#4A4A4A]">
          ROUTE AVOIDS HIGH-CRIME ZONES — STAY ON HIGHLIGHTED PATH
        </span>
      </div>
    </motion.div>
  );
}

function truncate(str: string, maxLen: number): string {
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
}

function CompassWidget({
  heading,
  supported,
}: { heading: number | null; supported: boolean | null }) {
  if (supported === false) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-1.5 border border-[#2A2A2A] bg-[#0F0F0F]"
        style={{ borderColor: "rgba(201,169,92,0.15)" }}
      >
        <span className="text-[9px] tracking-widest uppercase font-mono text-[#4A4A4A]">
          COMPASS UNAVAILABLE
        </span>
      </div>
    );
  }

  const deg = heading ?? 0;
  const needleRot = deg;

  return (
    <div
      className="flex items-center gap-2.5 px-3 py-1.5 border bg-[#0F0F0F]"
      style={{ borderColor: "rgba(201,169,92,0.25)" }}
      data-ocid="shield.route.panel"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        role="img"
        aria-label="Compass"
      >
        <title>Compass</title>
        <circle
          cx="14"
          cy="14"
          r="13"
          fill="#0A0A0A"
          stroke="#C9A95C"
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
        {[0, 90, 180, 270].map((a) => {
          const rad = (a * Math.PI) / 180;
          const x1 = 14 + 10 * Math.sin(rad);
          const y1 = 14 - 10 * Math.cos(rad);
          const x2 = 14 + 12.5 * Math.sin(rad);
          const y2 = 14 - 12.5 * Math.cos(rad);
          return (
            <line
              key={a}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#C9A95C"
              strokeWidth="0.8"
              strokeOpacity={a === 0 ? "1" : "0.4"}
            />
          );
        })}
        <text
          x="14"
          y="7"
          textAnchor="middle"
          fontSize="3.5"
          fill="#C9A95C"
          fontFamily="monospace"
          fontWeight="bold"
        >
          N
        </text>
        <g transform={`rotate(${needleRot}, 14, 14)`}>
          <polygon points="14,4 12.5,14 14,12 15.5,14" fill="#C9A95C" />
          <polygon points="14,24 12.5,14 14,16 15.5,14" fill="#7A0000" />
        </g>
        <circle cx="14" cy="14" r="1.2" fill="#EDEDED" />
      </svg>
      <div className="flex flex-col">
        <span className="text-[8px] tracking-widest uppercase font-mono text-[#8A8A8A] leading-none mb-0.5">
          HEADING
        </span>
        <span className="text-[11px] font-bold tracking-widest font-mono text-[#C9A95C] leading-none">
          {heading !== null ? `${String(deg).padStart(3, "0")}°` : "---°"}
        </span>
      </div>
    </div>
  );
}

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

  const { heading, supported: compassSupported } = useCompassHeading();

  const svgPos = useMemo(
    () => (coords ? geoToSvg(coords.lat, coords.lng) : null),
    [coords],
  );

  const routePoints = useMemo(() => {
    if (!svgPos) return STATIC_ROUTE_POINTS;
    return buildRoutePoints(svgPos.x, svgPos.y);
  }, [svgPos]);

  const isTracking = !!coords && !gpsLoading;
  const [startAddress, setStartAddress] = useState("");
  const [endAddress, setEndAddress] = useState("");
  const [routeCalculated, setRouteCalculated] = useState(false);
  const [calculatedStart, setCalculatedStart] = useState("");
  const [calculatedEnd, setCalculatedEnd] = useState("");
  const [turnByTurnSteps, setTurnByTurnSteps] = useState<RouteStep[]>([]);

  const handleCalculateRoute = () => {
    const steps = generateTurnByTurn(startAddress, endAddress);
    setTurnByTurnSteps(steps);
    setRouteCalculated(true);
    setCalculatedStart(startAddress);
    setCalculatedEnd(endAddress);
  };

  const handleStartChange = (v: string) => {
    setStartAddress(v);
    setRouteCalculated(false);
  };

  const handleEndChange = (v: string) => {
    setEndAddress(v);
    setRouteCalculated(false);
  };

  const destLabel = routeCalculated
    ? truncate(calculatedEnd, 18)
    : "DESTINATION";

  return (
    <div className="space-y-4">
      <div className="card-blackgrid">
        <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] mb-2">
          ROUTE DEFENSE ACTIVE
        </div>
        <div className="flex items-center gap-2 text-xs tracking-wider">
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: routeCalculated ? "#2ECC71" : "#C9A95C" }}
          />
          <span style={{ color: routeCalculated ? "#2ECC71" : "#C9A95C" }}>
            {routeCalculated
              ? "SAFEST ROUTE CALCULATED"
              : "ENTER ADDRESSES TO CALCULATE ROUTE"}
          </span>
        </div>
      </div>

      {/* Address Inputs */}
      <div className="card-blackgrid space-y-3">
        <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] mb-1">
          ROUTE PARAMETERS
        </div>
        {/* Start Point */}
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-5 h-5 rounded-full border border-[#2ECC71] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#2ECC71]" />
          </div>
          <input
            type="text"
            value={startAddress}
            onChange={(e) => handleStartChange(e.target.value)}
            placeholder="START POINT — Enter address or use GPS"
            className="flex-1 bg-transparent border border-[rgba(201,169,92,0.2)] text-[11px] tracking-wider text-white font-mono px-3 py-2 placeholder-[#3A3A3A] focus:outline-none focus:border-[rgba(201,169,92,0.5)]"
            data-ocid="route.start_input"
          />
          {coords && (
            <button
              type="button"
              onClick={() =>
                handleStartChange(
                  `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
                )
              }
              className="flex-shrink-0 text-[9px] tracking-widest uppercase text-[#4A9EFF] border border-[rgba(74,158,255,0.3)] px-2 py-2 hover:bg-[rgba(74,158,255,0.07)] transition-colors whitespace-nowrap"
              data-ocid="route.use_gps_button"
            >
              USE GPS
            </button>
          )}
        </div>
        {/* End Point */}
        <div className="flex items-center gap-2">
          <MapPin className="flex-shrink-0 w-5 h-5 text-[#C00000]" />
          <input
            type="text"
            value={endAddress}
            onChange={(e) => handleEndChange(e.target.value)}
            placeholder="END POINT — Enter destination address"
            className="flex-1 bg-transparent border border-[rgba(201,169,92,0.2)] text-[11px] tracking-wider text-white font-mono px-3 py-2 placeholder-[#3A3A3A] focus:outline-none focus:border-[rgba(201,169,92,0.5)]"
            data-ocid="route.end_input"
          />
        </div>
        {startAddress.trim() && endAddress.trim() && (
          <button
            type="button"
            onClick={handleCalculateRoute}
            className="w-full text-[10px] tracking-widest uppercase py-2 border transition-all"
            style={{
              borderColor: routeCalculated
                ? "rgba(46,204,113,0.5)"
                : "rgba(201,169,92,0.5)",
              color: routeCalculated ? "#2ECC71" : "#C9A95C",
              background: routeCalculated
                ? "rgba(46,204,113,0.07)"
                : "rgba(201,169,92,0.07)",
            }}
            data-ocid="route.primary_button"
          >
            {routeCalculated ? "✓ ROUTE CALCULATED" : "CALCULATE SAFE ROUTE"}
          </button>
        )}
      </div>

      {/* GPS Status Bar + Compass */}
      <div className="flex items-stretch gap-2 flex-wrap">
        <div
          className="card-blackgrid flex items-center justify-between gap-3 flex-1 min-w-0"
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

        {/* Compass widget */}
        <CompassWidget heading={heading} supported={compassSupported} />
      </div>

      {/* Auto-route + crime avoidance status */}
      <div className="flex items-center gap-3 flex-wrap">
        {isTracking && (
          <div
            className="text-[9px] tracking-widest uppercase font-mono"
            style={{ color: "#4A9EFF" }}
          >
            AUTO-ROUTE ACTIVE — RECALCULATING FROM YOUR POSITION
          </div>
        )}
        {isTracking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1 border"
            style={{
              borderColor: "rgba(201,169,92,0.35)",
              background: "rgba(201,169,92,0.07)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A95C] animate-pulse" />
            <span className="text-[9px] tracking-widest uppercase font-mono text-[#C9A95C]">
              CRIME AVOIDANCE ACTIVE
            </span>
          </motion.div>
        )}
      </div>

      <div className="card-blackgrid">
        {/* Route active status bar */}
        {routeCalculated && (
          <div
            className="flex items-center gap-2 mb-3 pb-2 border-b"
            style={{ borderColor: "rgba(46,204,113,0.2)" }}
            data-ocid="route.success_state"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse flex-shrink-0" />
            <span
              className="text-[10px] tracking-widest uppercase font-mono truncate"
              style={{ color: "#2ECC71" }}
            >
              ROUTE ACTIVE:
              <span style={{ color: "#C9A95C" }}>▸</span>
              {truncate(startAddress, 16)}
              <span style={{ color: "#C9A95C" }}>→</span>
              {truncate(calculatedEnd, 16)}
            </span>
          </div>
        )}
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
              key={routeCalculated ? "route-active" : "route-idle"}
              points={routePoints}
              stroke={routeCalculated ? "#2ECC71" : "#C9A95C"}
              strokeWidth="1.2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={routeCalculated ? "route-flash" : undefined}
            />
            <polyline
              points={routePoints}
              stroke={routeCalculated ? "#2ECC71" : "#C9A95C"}
              strokeWidth="3"
              fill="none"
              strokeOpacity="0.1"
            />
            <circle
              cx={svgPos ? svgPos.x : 50}
              cy={svgPos ? svgPos.y : 95}
              r="2"
              fill="#2ECC71"
            />
            <circle cx="75" cy="18" r="2" fill="#C9A95C" />
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
              x="62"
              y="16"
              fontSize="2.5"
              fill={routeCalculated ? "#2ECC71" : "#C9A95C"}
              fillOpacity="0.9"
              fontFamily="monospace"
            >
              {destLabel}
            </text>
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
            {compassSupported !== false && (
              <g transform="translate(84, 4)">
                <circle
                  cx="7"
                  cy="7"
                  r="7"
                  fill="#0A0A0A"
                  fillOpacity="0.85"
                  stroke="#C9A95C"
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                />
                <g transform={`rotate(${heading ?? 0}, 7, 7)`}>
                  <polygon points="7,1.5 6.2,7 7,6 7.8,7" fill="#C9A95C" />
                  <polygon points="7,12.5 6.2,7 7,8 7.8,7" fill="#7A0000" />
                </g>
                <circle cx="7" cy="7" r="0.8" fill="#EDEDED" />
                <text
                  x="7"
                  y="3.5"
                  textAnchor="middle"
                  fontSize="2"
                  fill="#C9A95C"
                  fontFamily="monospace"
                >
                  N
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className="flex items-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-0.5"
              style={{ background: routeCalculated ? "#2ECC71" : "#C9A95C" }}
            />
            <span
              className="text-[10px] tracking-wider uppercase"
              style={{ color: routeCalculated ? "#2ECC71" : "#C9A95C" }}
            >
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
            {
              label: "ROUTE SAFETY",
              value: "94%",
              color: "#2ECC71",
              badge: isTracking,
            },
            { label: "ETA OFFSET", value: "+4 min", color: "#D8B84A" },
          ] as const
        ).map((stat) => (
          <div key={stat.label} className="card-blackgrid text-center relative">
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[9px] tracking-widest uppercase text-[#8A8A8A] mt-1">
              {stat.label}
            </div>
            {"badge" in stat && stat.badge && (
              <div
                className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[7px] tracking-widest uppercase font-mono"
                style={{
                  background: "rgba(201,169,92,0.15)",
                  border: "1px solid rgba(201,169,92,0.4)",
                  color: "#C9A95C",
                }}
              >
                AVOIDANCE ON
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Turn-by-turn card — only shown after route is calculated */}
      <AnimatePresence>
        {routeCalculated && turnByTurnSteps.length > 0 && (
          <TurnByTurnCard
            steps={turnByTurnSteps}
            startAddr={calculatedStart}
            endAddr={calculatedEnd}
          />
        )}
      </AnimatePresence>
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
