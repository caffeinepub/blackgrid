import { ChevronRight } from "lucide-react";

interface KPIRowProps {
  alertCount?: number;
  onTabChange?: (tab: string) => void;
}

const QUICK_ACCESS = [
  { label: "Identity Scan", tab: "shield", sub: "Scan nearby users" },
  { label: "Watchlist", tab: "watchlist", sub: "Manage contacts" },
  { label: "Route Defense", tab: "shield", sub: "Safe navigation" },
];

export default function KPIRow({ alertCount = 3, onTabChange }: KPIRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-ocid="kpi.row">
      {/* Security Score Ring */}
      <div className="card-blackgrid flex flex-col items-center gap-4">
        <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A]">
          Security Score
        </div>
        <div className="relative w-28 h-28">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full -rotate-90"
            role="img"
            aria-label="Security score gauge"
          >
            <title>Security Score Gauge</title>
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#2A2A2A"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#C9A95C"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${0.84 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[#C9A95C]">84</span>
            <span className="text-[9px] text-[#8A8A8A]">/ 100</span>
          </div>
        </div>
        <div className="text-[10px] tracking-widest uppercase text-[#2ECC71] font-semibold">
          HIGH SECURITY
        </div>
      </div>

      {/* Threat Alerts */}
      <div className="card-blackgrid bg-[#120000] border-[#3A0000] red-glow flex flex-col gap-3">
        <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A]">
          Threat Alerts
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-wider uppercase text-[#B8B8B8]">
              CRITICAL
            </span>
            <span className="text-2xl font-bold text-[#C00000]">
              {alertCount}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-wider uppercase text-[#B8B8B8]">
              ACTIVE
            </span>
            <span className="text-lg font-bold text-[#D8B84A]">1</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs tracking-wider uppercase text-[#B8B8B8]">
              WARNINGS
            </span>
            <span className="text-lg font-bold text-[#8A8A8A]">0</span>
          </div>
        </div>
        <div className="text-[10px] tracking-widest uppercase text-[#C00000] mt-auto pt-2 border-t border-[#3A0000]">
          ⚠ ACTIVE THREAT DETECTED
        </div>
      </div>

      {/* Quick Access */}
      <div className="card-blackgrid flex flex-col gap-3">
        <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A]">
          Quick Access
        </div>
        {QUICK_ACCESS.map((item) => (
          <button
            type="button"
            key={item.label}
            onClick={() => onTabChange?.(item.tab)}
            className="flex items-center justify-between p-3 bg-[#0F0F0F] border border-[#2A2A2A] rounded hover:border-[#C9A95C] hover:bg-[#1A1500] transition-all group"
            data-ocid={`kpi.${item.label.toLowerCase().replace(" ", "_")}.button`}
          >
            <div>
              <div className="text-[11px] tracking-wider uppercase text-[#EDEDED] font-medium group-hover:text-[#C9A95C] transition-colors">
                {item.label}
              </div>
              <div className="text-[10px] text-[#8A8A8A] mt-0.5">
                {item.sub}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#8A8A8A] group-hover:text-[#C9A95C] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
