import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

(L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl =
  undefined;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const HIGH_RISK_ZONES = [
  { lat: 37.7625, lng: -122.4193, label: "Tenderloin" },
  { lat: 37.7599, lng: -122.4148, label: "SoMa" },
  { lat: 37.753, lng: -122.4089, label: "Mission District" },
  { lat: 37.7272, lng: -122.4044, label: "Bayview" },
  { lat: 37.7806, lng: -122.4324, label: "Western Addition" },
];

function AutoCenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const done = useRef(false);
  useEffect(() => {
    if (!done.current) {
      map.setView([lat, lng], 14);
      done.current = true;
    }
  }, [map, lat, lng]);
  return null;
}

interface RouteMapProps {
  userCoords: { lat: number; lng: number } | null;
  routeCalculated: boolean;
}

export default function RouteMap({
  userCoords,
  routeCalculated,
}: RouteMapProps) {
  const center: [number, number] = userCoords
    ? [userCoords.lat, userCoords.lng]
    : [37.7749, -122.4194];

  return (
    <div style={{ height: "300px", borderRadius: "8px", overflow: "hidden" }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {userCoords && <AutoCenter lat={userCoords.lat} lng={userCoords.lng} />}

        {/* Danger zone circles */}
        {HIGH_RISK_ZONES.map((z) => (
          <Circle
            key={z.label}
            center={[z.lat, z.lng]}
            radius={300}
            fillColor="#C00000"
            fillOpacity={0.2}
            color="#C00000"
            weight={1}
          >
            <Popup>
              <div
                style={{
                  background: "#111",
                  color: "#C00000",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  padding: "4px 8px",
                  fontSize: "11px",
                }}
              >
                ⚠ {z.label} — HIGH RISK ZONE
              </div>
            </Popup>
          </Circle>
        ))}

        {/* YOU marker */}
        {userCoords && (
          <CircleMarker
            center={[userCoords.lat, userCoords.lng]}
            radius={8}
            fillColor={routeCalculated ? "#2ECC71" : "#4A9EFF"}
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
  );
}
