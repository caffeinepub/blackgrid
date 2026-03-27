import { MapPin, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { Variant_low_severe_moderate } from "../backend.d";
import { useAreaIncidents } from "../hooks/useQueries";

const SEVERITY_CONFIG = {
  [Variant_low_severe_moderate.severe]: {
    label: "SEVERE",
    color: "#C00000",
    bg: "#120000",
    border: "#3A0000",
    glow: "rgba(192,0,0,0.2)",
  },
  [Variant_low_severe_moderate.moderate]: {
    label: "MODERATE",
    color: "#D8B84A",
    bg: "#121000",
    border: "#3A3000",
    glow: "rgba(216,184,74,0.15)",
  },
  [Variant_low_severe_moderate.low]: {
    label: "LOW",
    color: "#2ECC71",
    bg: "#001208",
    border: "#003A18",
    glow: "rgba(46,204,113,0.1)",
  },
};

const STATIC_INCIDENTS = [
  {
    severity: Variant_low_severe_moderate.severe,
    location: "Mission District, SF",
    incidentType: "Aggression Pattern Detected",
  },
  {
    severity: Variant_low_severe_moderate.severe,
    location: "Tenderloin, SF",
    incidentType: "Crowd Tension Spike",
  },
  {
    severity: Variant_low_severe_moderate.moderate,
    location: "SOMA District, SF",
    incidentType: "Suspicious Movement",
  },
  {
    severity: Variant_low_severe_moderate.moderate,
    location: "Civic Center, SF",
    incidentType: "Elevated Gathering",
  },
  {
    severity: Variant_low_severe_moderate.low,
    location: "Financial District, SF",
    incidentType: "Minor Disturbance",
  },
  {
    severity: Variant_low_severe_moderate.low,
    location: "Union Square, SF",
    incidentType: "Noise Complaint",
  },
];

export default function IntelligenceTab() {
  const {
    data: incidents,
    isLoading,
    refetch,
    isFetching,
  } = useAreaIncidents();
  const displayedIncidents =
    incidents && incidents.length > 0 ? incidents : STATIC_INCIDENTS;

  const severeCount = displayedIncidents.filter(
    (i) => i.severity === Variant_low_severe_moderate.severe,
  ).length;
  const moderateCount = displayedIncidents.filter(
    (i) => i.severity === Variant_low_severe_moderate.moderate,
  ).length;
  const lowCount = displayedIncidents.filter(
    (i) => i.severity === Variant_low_severe_moderate.low,
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between pb-4 border-b border-[#1A1A1A]">
        <div>
          <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
            REAL-TIME FEED
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase text-[#EDEDED]">
            Area Intelligence
          </h1>
          <p className="text-xs text-[#8A8A8A] mt-1 tracking-wide">
            San Francisco — Live incident monitoring
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          data-ocid="intelligence.secondary_button"
          className="flex items-center gap-2 px-4 py-2 border border-[#2A2A2A] text-[#8A8A8A] hover:border-[#C9A95C] hover:text-[#C9A95C] transition-all text-[10px] tracking-widest uppercase"
        >
          <RefreshCw
            className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`}
          />
          REFRESH
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(
          [
            {
              label: "SEVERE",
              count: severeCount,
              color: "#C00000",
              bg: "#120000",
              border: "#3A0000",
            },
            {
              label: "MODERATE",
              count: moderateCount,
              color: "#D8B84A",
              bg: "#121000",
              border: "#3A3000",
            },
            {
              label: "LOW",
              count: lowCount,
              color: "#2ECC71",
              bg: "#001208",
              border: "#003A18",
            },
          ] as const
        ).map((stat) => (
          <div
            key={stat.label}
            className="text-center p-4 rounded border"
            style={{ backgroundColor: stat.bg, borderColor: stat.border }}
          >
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.count}
            </div>
            <div
              className="text-[9px] tracking-widest uppercase mt-1"
              style={{ color: stat.color }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div
          className="card-blackgrid text-center py-12"
          data-ocid="intelligence.loading_state"
        >
          <div className="text-[#C9A95C] text-xs tracking-widest uppercase animate-pulse">
            SCANNING AREA...
          </div>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="intelligence.list">
          {displayedIncidents.length === 0 ? (
            <div
              className="card-blackgrid text-center py-12"
              data-ocid="intelligence.empty_state"
            >
              <div className="text-[#8A8A8A] text-sm tracking-wider">
                No incidents detected in your area.
              </div>
            </div>
          ) : (
            displayedIncidents.map((incident, i) => {
              const cfg =
                SEVERITY_CONFIG[incident.severity] ??
                SEVERITY_CONFIG[Variant_low_severe_moderate.low];
              return (
                <motion.div
                  key={`${incident.location}-${incident.incidentType}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`intelligence.item.${i + 1}`}
                  className="flex items-center gap-4 p-4 rounded border"
                  style={{
                    backgroundColor: cfg.bg,
                    borderColor: cfg.border,
                    boxShadow: `inset 0 0 20px ${cfg.glow}`,
                  }}
                >
                  <div
                    className="flex-shrink-0 w-16 text-center px-2 py-1 text-[9px] tracking-widest uppercase font-bold rounded"
                    style={{
                      color: cfg.color,
                      border: `1px solid ${cfg.border}`,
                    }}
                  >
                    {cfg.label}
                  </div>
                  <MapPin
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: cfg.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold tracking-wider uppercase text-[#EDEDED]">
                      {incident.incidentType}
                    </div>
                    <div className="text-xs text-[#8A8A8A] mt-0.5">
                      {incident.location}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
