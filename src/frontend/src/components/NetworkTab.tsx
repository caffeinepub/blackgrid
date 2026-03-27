import { Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Variant_avoid_safe_unknown } from "../backend.d";
import { useAddWatchlistEntry, useIsCallerAdmin } from "../hooks/useQueries";

const SAMPLE_MEMBERS = [
  {
    name: "A. STERLING",
    tier: "BLACK TIER",
    trustScore: 98,
    badge: "BUSINESS",
    location: "San Francisco, CA",
  },
  {
    name: "R. HAYES",
    tier: "ELITE OPERATIVE",
    trustScore: 87,
    badge: "PERSONAL",
    location: "Oakland, CA",
  },
  {
    name: "V. CROSS",
    tier: "BLACK TIER",
    trustScore: 95,
    badge: "BUSINESS",
    location: "Palo Alto, CA",
  },
  {
    name: "M. VANCE",
    tier: "ELITE OPERATIVE",
    trustScore: 79,
    badge: "PERSONAL",
    location: "San Jose, CA",
  },
  {
    name: "D. MERCER",
    tier: "BLACK TIER",
    trustScore: 91,
    badge: "BUSINESS",
    location: "Marin County, CA",
  },
  {
    name: "T. BLAKE",
    tier: "ELITE OPERATIVE",
    trustScore: 83,
    badge: "PERSONAL",
    location: "Berkeley, CA",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);
}

export default function NetworkTab() {
  const { data: isAdmin } = useIsCallerAdmin();
  const addEntry = useAddWatchlistEntry();
  const [connected, setConnected] = useState<Set<string>>(new Set());

  const handleConnect = async (memberName: string) => {
    if (connected.has(memberName)) return;
    try {
      await addEntry.mutateAsync({
        id: 0n,
        tag: Variant_avoid_safe_unknown.safe,
        addedAt: 0n,
        notes: "Network connection",
        targetName: memberName,
        interactionHistory: [],
      });
      setConnected((prev) => new Set([...prev, memberName]));
      toast.success("CONTACT ADDED TO WATCHLIST");
    } catch {
      toast.error("Failed to connect.");
    }
  };

  const members = SAMPLE_MEMBERS;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between pb-4 border-b border-[#1A1A1A]">
        <div>
          <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
            VERIFIED CONNECTIONS
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase text-[#EDEDED]">
            Member Network
          </h1>
          <p className="text-xs text-[#8A8A8A] mt-1 tracking-wide">
            Connect with verified BLACKGRID operatives.
          </p>
        </div>
        <div
          className="w-14 h-14 border border-[#C9A95C]/40 flex items-center justify-center"
          style={{ background: "rgba(201,169,92,0.06)" }}
        >
          <Users className="w-6 h-6 text-[#C9A95C]" />
        </div>
      </div>

      {isAdmin && (
        <div
          className="px-4 py-2 border border-[#C9A95C]/20 text-[9px] tracking-widest uppercase text-[#C9A95C]"
          style={{ background: "rgba(201,169,92,0.04)" }}
        >
          ADMIN VIEW — MEMBER DIRECTORY
        </div>
      )}

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        data-ocid="network.list"
      >
        {members.map((member, i) => {
          const isConnected = connected.has(member.name);
          return (
            <div
              key={member.name}
              data-ocid={`network.item.${i + 1}`}
              className="card-blackgrid flex gap-4 items-start"
            >
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-[#0A0A0A] font-bold text-sm"
                style={{
                  background: "linear-gradient(135deg, #C9A95C, #E8C878)",
                }}
              >
                {getInitials(member.name)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-bold tracking-wider uppercase text-[#EDEDED]">
                    {member.name}
                  </span>
                  <span
                    className="text-[7px] tracking-widest uppercase px-1.5 py-0.5 flex-shrink-0"
                    style={{
                      color:
                        member.tier === "BLACK TIER" ? "#C9A95C" : "#8A8A8A",
                      border: `1px solid ${member.tier === "BLACK TIER" ? "rgba(201,169,92,0.3)" : "rgba(138,138,138,0.3)"}`,
                      background:
                        member.tier === "BLACK TIER"
                          ? "rgba(201,169,92,0.06)"
                          : "transparent",
                    }}
                  >
                    {member.tier}
                  </span>
                </div>

                <div className="text-[9px] tracking-wider uppercase text-[#8A8A8A] mb-2">
                  {member.badge} · {member.location}
                </div>

                {/* Trust Score Bar */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-0.5 bg-[#1A1A1A] rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{
                        width: `${member.trustScore}%`,
                        background: "linear-gradient(90deg, #C9A95C, #E8C878)",
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-[#C9A95C]">
                    {member.trustScore}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleConnect(member.name)}
                  disabled={isConnected || addEntry.isPending}
                  data-ocid={`network.connect.button.${i + 1}`}
                  className="px-3 py-1.5 text-[8px] tracking-[0.2em] uppercase font-bold transition-all"
                  style={
                    isConnected
                      ? {
                          color: "#2ECC71",
                          border: "1px solid rgba(46,204,113,0.3)",
                          background: "rgba(46,204,113,0.06)",
                        }
                      : {
                          color: "#C9A95C",
                          border: "1px solid rgba(201,169,92,0.3)",
                          background: "rgba(201,169,92,0.06)",
                        }
                  }
                >
                  {isConnected ? "✓ CONNECTED" : "CONNECT"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {members.length === 0 && (
        <div
          className="card-blackgrid text-center py-12"
          data-ocid="network.empty_state"
        >
          <Users className="w-10 h-10 text-[#2A2A2A] mx-auto mb-3" />
          <div className="text-[#8A8A8A] text-xs tracking-widest uppercase">
            No members found in network.
          </div>
        </div>
      )}
    </div>
  );
}
