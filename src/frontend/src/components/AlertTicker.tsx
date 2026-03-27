import { AlertTriangle } from "lucide-react";

const ALERTS = [
  {
    text: "[CRITICAL] High-risk activity detected, Mission District, SF",
    time: "2m ago",
    id: "critical-mission",
  },
  {
    text: "[ALERT] Watchlist contact flagged, SOMA District",
    time: "5m ago",
    id: "alert-soma",
  },
  {
    text: "[WARNING] Elevated crowd tension, Union Square",
    time: "12m ago",
    id: "warn-union",
  },
  {
    text: "[CRITICAL] Aggression pattern detected, Tenderloin",
    time: "18m ago",
    id: "critical-tenderloin",
  },
  {
    text: "[ALERT] Unknown individual, Financial District",
    time: "24m ago",
    id: "alert-fidi",
  },
];

export default function AlertTicker() {
  const doubled = [
    ...ALERTS.map((a) => ({ ...a, key: `a-${a.id}` })),
    ...ALERTS.map((a) => ({ ...a, key: `b-${a.id}` })),
  ];
  return (
    <div className="space-y-2" data-ocid="alert_ticker.section">
      <div className="overflow-hidden bg-[#120000] border border-[#3A0000] rounded">
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-r border-[#3A0000] bg-[#7A0000]">
            <AlertTriangle className="w-3 h-3 text-[#EDEDED]" />
            <span className="text-[10px] tracking-widest uppercase text-[#EDEDED] font-bold whitespace-nowrap">
              THREAT FEED
            </span>
          </div>
          <div className="overflow-hidden flex-1 py-2.5">
            <div className="animate-ticker flex gap-16 whitespace-nowrap">
              {doubled.map((alert) => (
                <span
                  key={alert.key}
                  className="text-[11px] tracking-wider text-[#EDEDED]"
                >
                  <span className="text-[#C00000] font-bold mr-2">
                    {alert.text.split("]")[0]}]
                  </span>
                  {alert.text.split("]").slice(1).join("]")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden bg-[#0D0D0D] border border-[#2A2A2A] rounded">
        <div className="flex items-center">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-r border-[#2A2A2A]">
            <span className="text-[10px] tracking-widest uppercase text-[#8A8A8A] whitespace-nowrap">
              RECENT
            </span>
          </div>
          <div className="overflow-hidden flex-1 py-2">
            <div className="animate-ticker flex gap-12 whitespace-nowrap">
              {doubled.map((alert) => (
                <span
                  key={alert.key}
                  className="text-[10px] tracking-wider text-[#8A8A8A]"
                >
                  <span className="text-[#C9A95C] mr-2">{alert.time}</span>—{" "}
                  {alert.text.split("] ")[1]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
