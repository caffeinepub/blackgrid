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
import RouteMap from "./RouteMap";

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

function truncate(s: string, maxLen: number): string {
  if (!s) return "";
  return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
}

interface RouteStep {
  icon: React.ReactNode;
  instruction: string;
  distance: string;
}

function generateTurnByTurn(start: string, end: string): RouteStep[] {
  const s = start || "Your location";
  const e = end || "Destination";
  return [
    {
      icon: <ArrowUp className="w-4 h-4 text-[#2ECC71]" />,
      instruction: `Depart from ${truncate(s, 20)}`,
      distance: "0.0 mi",
    },
    {
      icon: <ArrowRight className="w-4 h-4 text-[#C9A95C]" />,
      instruction: "Turn right onto Market St",
      distance: "0.3 mi",
    },
    {
      icon: <CornerUpRight className="w-4 h-4 text-[#C9A95C]" />,
      instruction: "Merge onto Van Ness Ave — avoiding Tenderloin",
      distance: "0.5 mi",
    },
    {
      icon: <ArrowLeft className="w-4 h-4 text-[#C9A95C]" />,
      instruction: "Turn left onto Geary Blvd",
      distance: "0.4 mi",
    },
    {
      icon: <CornerDownLeft className="w-4 h-4 text-[#C9A95C]" />,
      instruction: "Bear right onto Divisadero St",
      distance: "0.2 mi",
    },
    {
      icon: <ArrowDown className="w-4 h-4 text-[#2ECC71]" />,
      instruction: `Arrive at ${truncate(e, 20)}`,
      distance: "0.0 mi",
    },
  ];
}

function CompassWidget({
  heading,
  supported,
}: { heading: number | null; supported: boolean | null }) {
  if (supported === false) return null;
  return (
    <div
      className="flex items-center gap-3 p-3 rounded border"
      style={{
        background: "rgba(201,169,92,0.05)",
        borderColor: "rgba(201,169,92,0.2)",
      }}
    >
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 28 28" width="32" height="32" aria-label="Compass">
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
          <g transform={`rotate(${heading ?? 0}, 14, 14)`}>
            <polygon points="14,3 12.5,14 14,12 15.5,14" fill="#C9A95C" />
            <polygon points="14,25 12.5,14 14,16 15.5,14" fill="#7A0000" />
          </g>
          <circle cx="14" cy="14" r="1.2" fill="#EDEDED" />
          <text
            x="14"
            y="7"
            textAnchor="middle"
            fontSize="3.5"
            fill="#C9A95C"
            fontFamily="monospace"
          >
            N
          </text>
        </svg>
      </div>
      <div>
        <div className="text-[9px] tracking-widest uppercase text-[#8A8A8A]">
          HEADING
        </div>
        <div className="text-sm font-bold text-[#C9A95C] font-mono">
          {heading !== null ? `${Math.round(heading)}°` : "—"}
        </div>
      </div>
    </div>
  );
}

function TurnByTurnCard({
  steps,
  startAddr,
  endAddr,
}: { steps: RouteStep[]; startAddr: string; endAddr: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="card-blackgrid"
    >
      <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] mb-3">
        TURN-BY-TURN ROUTE
      </div>
      <div className="text-[9px] text-[#8A8A8A] mb-3 font-mono truncate">
        {truncate(startAddr, 18)} <span className="text-[#C9A95C]">→</span>{" "}
        {truncate(endAddr, 18)}
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.instruction}
            className="flex items-center gap-3 py-1.5 border-b border-[#1A1A1A] last:border-0"
          >
            <div className="flex-shrink-0">{step.icon}</div>
            <div className="flex-1 text-[11px] text-[#EDEDED]">
              {step.instruction}
            </div>
            <div className="text-[10px] text-[#8A8A8A] font-mono">
              {step.distance}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function IdentityScan() {
  const { startScanning, stopScanning, isScanning, qrResults } = useQRScanner({
    facingMode: "environment",
  });
  const [scannedProfile, setScannedProfile] = useState<{
    name: string;
    badge: string;
  } | null>(null);

  useEffect(() => {
    if (qrResults.length > 0) {
      setScannedProfile({ name: qrResults[0].data, badge: "VERIFIED" });
      stopScanning();
    }
  }, [qrResults, stopScanning]);

  return (
    <div className="space-y-4">
      <div className="card-blackgrid text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <ScanLine className="w-5 h-5 text-[#C9A95C]" />
          <span className="text-xs tracking-widest uppercase text-[#C9A95C]">
            IDENTITY SCAN
          </span>
        </div>
        <p className="text-[11px] text-[#8A8A8A] mb-4">
          Scan a BLACKGRID QR badge to verify operative identity.
        </p>
        {!isScanning && !scannedProfile && (
          <button
            type="button"
            onClick={startScanning}
            data-ocid="shield.scan.button"
            className="flex items-center gap-2 mx-auto px-6 py-2.5 border border-[#C9A95C] text-[#C9A95C] text-[10px] tracking-widest uppercase hover:bg-[#C9A95C] hover:text-[#0A0A0A] transition-all"
          >
            <Camera className="w-4 h-4" />
            START SCAN
          </button>
        )}
        {isScanning && (
          <div className="space-y-3">
            <div className="w-8 h-8 border-2 border-[#C9A95C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[10px] tracking-wider text-[#C9A95C]">
              SCANNING…
            </p>
            <button
              type="button"
              onClick={stopScanning}
              data-ocid="shield.scan.close_button"
              className="text-[9px] tracking-widest uppercase text-[#8A8A8A] hover:text-[#C9A95C]"
            >
              CANCEL
            </button>
          </div>
        )}
      </div>
      {scannedProfile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-blackgrid border border-[#2ECC71] border-opacity-30"
        >
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-[#2ECC71]" />
            <span className="text-xs tracking-widest uppercase text-[#2ECC71]">
              IDENTITY VERIFIED
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-[#C9A95C] flex items-center justify-center bg-[#1A1A1A]">
              <span className="text-lg">🛡</span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#EDEDED] mb-0.5">
                {scannedProfile.name}
              </div>
              <div className="text-[9px] tracking-widest uppercase text-[#C9A95C]">
                {scannedProfile.badge}
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
        <RouteMap userCoords={coords} routeCalculated={routeCalculated} />

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
