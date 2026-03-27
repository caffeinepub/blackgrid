import { AlertTriangle, MapPin } from "lucide-react";
import { motion } from "motion/react";
import {
  Variant_free_elite_black,
  Variant_low_severe_moderate,
} from "../backend.d";
import {
  useAreaIncidents,
  useProfile,
  useUnreadAlertCount,
} from "../hooks/useQueries";
import AlertTicker from "./AlertTicker";
import KPIRow from "./KPIRow";
import LiveMap from "./LiveMap";

interface DashboardTabProps {
  onTabChange: (tab: string) => void;
}

const SEVERITY_CONFIG = {
  [Variant_low_severe_moderate.severe]: {
    color: "#C00000",
    bg: "#120000",
    border: "#3A0000",
    label: "SEVERE",
  },
  [Variant_low_severe_moderate.moderate]: {
    color: "#D8B84A",
    bg: "#121000",
    border: "#3A3000",
    label: "MODERATE",
  },
  [Variant_low_severe_moderate.low]: {
    color: "#2ECC71",
    bg: "#001208",
    border: "#003A18",
    label: "LOW",
  },
};

const TIER_LABELS = {
  [Variant_free_elite_black.free]: "FREE TIER",
  [Variant_free_elite_black.elite]: "ELITE OPERATIVE",
  [Variant_free_elite_black.black]: "BLACK TIER",
};

const STATIC_INCIDENTS = [
  {
    severity: Variant_low_severe_moderate.severe,
    location: "Mission District, SF",
    incidentType: "Aggression Detected",
  },
  {
    severity: Variant_low_severe_moderate.moderate,
    location: "SOMA District, SF",
    incidentType: "Suspicious Movement",
  },
  {
    severity: Variant_low_severe_moderate.low,
    location: "Financial District, SF",
    incidentType: "Minor Disturbance",
  },
  {
    severity: Variant_low_severe_moderate.severe,
    location: "Tenderloin, SF",
    incidentType: "Crowd Tension Spike",
  },
];

export default function DashboardTab({ onTabChange }: DashboardTabProps) {
  const { data: profile } = useProfile();
  const { data: incidents } = useAreaIncidents();
  const { data: alertCount } = useUnreadAlertCount();

  const displayedIncidents =
    incidents && incidents.length > 0 ? incidents : STATIC_INCIDENTS;
  const count = alertCount ? Number(alertCount) : 3;
  const tier = profile?.subscriptionTier ?? Variant_free_elite_black.free;
  const tierLabel = TIER_LABELS[tier] ?? "FREE TIER";
  const name = profile?.name ?? "OPERATIVE";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "GOOD MORNING" : hour < 17 ? "GOOD AFTERNOON" : "GOOD EVENING";

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1A1A1A]"
      >
        <div>
          <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
            {greeting}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-[#EDEDED]">
            {name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
            <span className="text-xs tracking-widest uppercase text-[#C9A95C]">
              CURRENT STATUS: {tierLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {count > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#120000] border border-[#3A0000] rounded">
              <AlertTriangle className="w-4 h-4 text-[#C00000]" />
              <span className="text-xs tracking-widest uppercase text-[#C00000] font-bold">
                {count} ALERT{count !== 1 ? "S" : ""}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <LiveMap />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <KPIRow alertCount={count} onTabChange={onTabChange} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <AlertTicker />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="mb-4">
          <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
            AREA INTELLIGENCE
          </div>
          <h2 className="text-lg font-bold tracking-wider uppercase text-[#EDEDED]">
            Recent Incidents
          </h2>
        </div>
        <div className="space-y-2" data-ocid="incidents.list">
          {displayedIncidents.length === 0 ? (
            <div
              className="card-blackgrid text-center py-8"
              data-ocid="incidents.empty_state"
            >
              <div className="text-[#8A8A8A] text-sm tracking-wider">
                No incidents reported in your area.
              </div>
            </div>
          ) : (
            displayedIncidents.map((incident, i) => {
              const cfg =
                SEVERITY_CONFIG[incident.severity] ??
                SEVERITY_CONFIG[Variant_low_severe_moderate.low];
              return (
                <div
                  key={`${incident.location}-${incident.incidentType}`}
                  data-ocid={`incidents.item.${i + 1}`}
                  className="flex items-center gap-4 p-4 rounded border transition-colors"
                  style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                >
                  <div
                    className="flex-shrink-0 px-2 py-1 text-[9px] tracking-widest uppercase font-bold rounded"
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
                    <div className="text-xs font-semibold tracking-wider uppercase text-[#EDEDED]">
                      {incident.incidentType}
                    </div>
                    <div className="text-[11px] text-[#8A8A8A]">
                      {incident.location}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
