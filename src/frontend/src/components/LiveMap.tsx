import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

// Fix Leaflet default icon paths
(L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl =
  undefined;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const THREATS = [
  {
    lat: 37.7625,
    lng: -122.4193,
    color: "#C00000",
    label: "HIGH RISK",
    neighborhood: "Tenderloin",
    type: "Violent Crime Hotspot",
    desc: "Elevated assault and robbery reports. Avoid after dark.",
  },
  {
    lat: 37.7599,
    lng: -122.4148,
    color: "#C00000",
    label: "HIGH RISK",
    neighborhood: "SoMa",
    type: "Theft & Assault Zone",
    desc: "High vehicle break-in and mugging activity.",
  },
  {
    lat: 37.753,
    lng: -122.4089,
    color: "#C00000",
    label: "HIGH RISK",
    neighborhood: "Mission District",
    type: "Gang Activity",
    desc: "Active gang territory. Multiple shooting incidents reported.",
  },
  {
    lat: 37.7272,
    lng: -122.4044,
    color: "#C00000",
    label: "HIGH RISK",
    neighborhood: "Bayview",
    type: "High Crime Zone",
    desc: "Property crime and violent incidents above city average.",
  },
  {
    lat: 37.7806,
    lng: -122.4324,
    color: "#C00000",
    label: "HIGH RISK",
    neighborhood: "Western Addition",
    type: "Drug Activity",
    desc: "Open drug market. Robbery incidents reported frequently.",
  },
  {
    lat: 37.7749,
    lng: -122.4194,
    color: "#D8B84A",
    label: "MONITOR",
    neighborhood: "Civic Center",
    type: "Elevated Watch",
    desc: "Public safety incidents near plaza. Stay alert.",
  },
  {
    lat: 37.7693,
    lng: -122.4461,
    color: "#D8B84A",
    label: "MONITOR",
    neighborhood: "Haight-Ashbury",
    type: "Suspicious Activity",
    desc: "Unverified reports of vandalism and loitering.",
  },
  {
    lat: 37.7752,
    lng: -122.3978,
    color: "#D8B84A",
    label: "MONITOR",
    neighborhood: "Potrero Hill",
    type: "Under Surveillance",
    desc: "Incident reports being verified by network.",
  },
  {
    lat: 37.7879,
    lng: -122.4074,
    color: "#2ECC71",
    label: "CLEAR",
    neighborhood: "Nob Hill",
    type: "Low Risk Area",
    desc: "No active threats. Safe passage confirmed.",
  },
  {
    lat: 37.8024,
    lng: -122.4058,
    color: "#2ECC71",
    label: "CLEAR",
    neighborhood: "North Beach",
    type: "Verified Safe",
    desc: "Operative network verified. Low incident rate.",
  },
  {
    lat: 37.7786,
    lng: -122.4943,
    color: "#2ECC71",
    label: "CLEAR",
    neighborhood: "Richmond District",
    type: "Safe Zone",
    desc: "Residential, low crime, BLACKGRID operatives present.",
  },
  {
    lat: 37.7599,
    lng: -122.5108,
    color: "#2ECC71",
    label: "CLEAR",
    neighborhood: "Sunset District",
    type: "Safe Zone",
    desc: "Low threat level. Recommended safe passage.",
  },
];

function MapAutoCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const centered = useRef(false);
  useEffect(() => {
    if (!centered.current) {
      map.setView([lat, lng], 13);
      centered.current = true;
    }
  }, [map, lat, lng]);
  return null;
}

export default function LiveMap() {
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) =>
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return (
    <div
      className="card-blackgrid border-gold gold-glow"
      data-ocid="live_map.card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#C00000] animate-pulse" />
          <span className="text-xs tracking-widest uppercase text-[#EDEDED] font-medium">
            LIVE THREAT GRID
          </span>
          <span className="text-xs text-[#C9A95C] tracking-wider">
            | SAN FRANCISCO
          </span>
        </div>
        <span className="text-[10px] tracking-widest text-[#8A8A8A] uppercase">
          REAL-TIME
        </span>
      </div>

      {/* Map */}
      <div style={{ borderRadius: "8px", overflow: "hidden", height: "400px" }}>
        <MapContainer
          center={[37.7749, -122.4194]}
          zoom={13}
          style={{ height: "400px", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {userPos && <MapAutoCenter lat={userPos.lat} lng={userPos.lng} />}

          {/* Threat markers */}
          {THREATS.map((t) => (
            <CircleMarker
              key={`${t.neighborhood}-${t.lat}`}
              center={[t.lat, t.lng]}
              radius={t.label === "HIGH RISK" ? 10 : 8}
              fillColor={t.color}
              color="#000"
              weight={1}
              fillOpacity={0.85}
            >
              <Popup>
                <div
                  style={{
                    background: "#111",
                    color: "#EDEDED",
                    padding: "8px",
                    minWidth: "180px",
                    fontFamily: "monospace",
                    borderRadius: "4px",
                  }}
                >
                  <div
                    style={{
                      color: "#C9A95C",
                      fontWeight: 700,
                      fontSize: "13px",
                      marginBottom: "4px",
                    }}
                  >
                    {t.neighborhood}
                  </div>
                  <span
                    style={{
                      background: t.color,
                      color: t.color === "#2ECC71" ? "#000" : "#FFF",
                      fontSize: "9px",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      display: "inline-block",
                      marginBottom: "6px",
                    }}
                  >
                    {t.label}
                  </span>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {t.type}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#AAAAAA",
                      lineHeight: 1.4,
                    }}
                  >
                    {t.desc}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* YOU marker */}
          {userPos && (
            <CircleMarker
              center={[userPos.lat, userPos.lng]}
              radius={8}
              fillColor="#4A9EFF"
              color="#FFF"
              weight={2}
              fillOpacity={0.9}
            >
              <Popup>
                <div
                  style={{
                    background: "#111",
                    color: "#4A9EFF",
                    fontFamily: "monospace",
                    fontWeight: 700,
                    padding: "6px",
                  }}
                >
                  YOU ARE HERE
                </div>
              </Popup>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#C00000" }}
          />
          <span className="text-[10px] tracking-wider uppercase text-[#B8B8B8]">
            Risk Zones
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#D8B84A" }}
          />
          <span className="text-[10px] tracking-wider uppercase text-[#B8B8B8]">
            Monitor
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#2ECC71" }}
          />
          <span className="text-[10px] tracking-wider uppercase text-[#B8B8B8]">
            Verified
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "#4A9EFF" }}
          />
          <span className="text-[10px] tracking-wider uppercase text-[#B8B8B8]">
            You
          </span>
        </div>
      </div>

      {/* Threat detail panel */}
      <div
        className="mt-4 rounded border p-3"
        style={{ background: "#111", borderColor: "#C9A95C" }}
      >
        <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] mb-3">
          ACTIVE THREATS
        </div>
        <div
          className="space-y-2 overflow-y-auto"
          style={{ maxHeight: "12rem" }}
        >
          {THREATS.map((t) => (
            <div
              key={`panel-${t.neighborhood}`}
              className="flex items-start gap-3 pl-2 py-1.5"
              style={{ borderLeft: `3px solid ${t.color}` }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#EDEDED]">
                    {t.neighborhood}
                  </span>
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background: `${t.color}33`,
                      color: t.color,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {t.label}
                  </span>
                </div>
                <div className="text-[10px] text-[#8A8A8A]">{t.type}</div>
                <div className="text-[9px] text-[#666] mt-0.5 leading-tight">
                  {t.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
