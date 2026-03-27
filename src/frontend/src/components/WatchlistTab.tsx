import {
  Crown,
  HelpCircle,
  Plus,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Variant_avoid_safe_unknown } from "../backend.d";
import {
  useAddWatchlistEntry,
  useIsEliteSubscriber,
  useRemoveWatchlistEntry,
  useWatchlist,
} from "../hooks/useQueries";

const TAG_CONFIG = {
  [Variant_avoid_safe_unknown.safe]: {
    label: "SAFE",
    color: "#2ECC71",
    bg: "#001208",
    border: "#003A18",
    Icon: UserCheck,
  },
  [Variant_avoid_safe_unknown.unknown_]: {
    label: "UNKNOWN",
    color: "#D8B84A",
    bg: "#121000",
    border: "#3A3000",
    Icon: HelpCircle,
  },
  [Variant_avoid_safe_unknown.avoid]: {
    label: "AVOID",
    color: "#C00000",
    bg: "#120000",
    border: "#3A0000",
    Icon: UserX,
  },
};

const STATIC_WATCHLIST = [
  {
    id: BigInt(1),
    targetName: "Marcus Chen",
    tag: Variant_avoid_safe_unknown.safe,
    notes: "Business associate. Met at tech summit. Verified identity.",
    addedAt: BigInt(Date.now()),
    interactionHistory: [] as Array<[bigint, string]>,
  },
  {
    id: BigInt(2),
    targetName: "Unknown Male #4471",
    tag: Variant_avoid_safe_unknown.avoid,
    notes: "Followed me from Union Square. Aggressive behavior documented.",
    addedAt: BigInt(Date.now() - 86400000),
    interactionHistory: [] as Array<[bigint, string]>,
  },
  {
    id: BigInt(3),
    targetName: "Sarah Vance",
    tag: Variant_avoid_safe_unknown.unknown_,
    notes: "Met at networking event. Unverified identity.",
    addedAt: BigInt(Date.now() - 172800000),
    interactionHistory: [] as Array<[bigint, string]>,
  },
];

export default function WatchlistTab() {
  const { data: isElite } = useIsEliteSubscriber();
  const { data: watchlistData } = useWatchlist();
  const addEntry = useAddWatchlistEntry();
  const removeEntry = useRemoveWatchlistEntry();

  const [name, setName] = useState("");
  const [tag, setTag] = useState<Variant_avoid_safe_unknown>(
    Variant_avoid_safe_unknown.unknown_,
  );
  const [notes, setNotes] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const watchlist =
    watchlistData && watchlistData.length > 0
      ? watchlistData
      : STATIC_WATCHLIST;

  if (isElite === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div
          className="card-blackgrid max-w-md border-[#C9A95C44]"
          data-ocid="watchlist.upgrade.card"
        >
          <Crown className="w-12 h-12 text-[#C9A95C] mx-auto mb-4" />
          <h2 className="text-xl font-bold tracking-widest uppercase text-[#EDEDED] mb-2">
            Elite Access Required
          </h2>
          <p className="text-sm text-[#8A8A8A] tracking-wide leading-relaxed mb-6">
            The Watchlist Intelligence System is available exclusively to Elite
            and Black tier operatives.
          </p>
          <button
            type="button"
            data-ocid="watchlist.upgrade.primary_button"
            className="w-full py-3 bg-[#C9A95C] text-[#0A0A0A] text-xs tracking-widest uppercase font-bold hover:bg-[#E8C878] transition-all"
          >
            UPGRADE TO ELITE — $79/MO
          </button>
        </div>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!name.trim()) return;
    setIsAdding(true);
    try {
      await addEntry.mutateAsync({
        id: BigInt(0),
        targetName: name.trim(),
        tag,
        notes,
        addedAt: BigInt(Date.now()),
        interactionHistory: [],
      });
      setName("");
      setNotes("");
      setTag(Variant_avoid_safe_unknown.unknown_);
      toast.success("Contact added to watchlist");
    } catch {
      toast.error("Failed to add contact");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (id: bigint) => {
    try {
      await removeEntry.mutateAsync(id);
      toast.success("Contact removed");
    } catch {
      toast.error("Failed to remove contact");
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#1A1A1A]">
        <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
          INTELLIGENCE VAULT
        </div>
        <h1 className="text-2xl font-bold tracking-widest uppercase text-[#EDEDED]">
          Watchlist
        </h1>
        <p className="text-xs text-[#8A8A8A] mt-1 tracking-wide">
          Your private contact intelligence system.
        </p>
      </div>

      <div
        className="card-blackgrid border-[#C9A95C22]"
        data-ocid="watchlist.add.panel"
      >
        <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] mb-4">
          ADD CONTACT
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="wl-name"
              className="text-[10px] tracking-widest uppercase text-[#8A8A8A] block mb-1.5"
            >
              Contact Name
            </label>
            <input
              id="wl-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name or identifier..."
              data-ocid="watchlist.input"
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#EDEDED] placeholder-[#4A4A4A] focus:border-[#C9A95C] focus:outline-none tracking-wide"
            />
          </div>
          <div>
            <label
              htmlFor="wl-tag"
              className="text-[10px] tracking-widest uppercase text-[#8A8A8A] block mb-1.5"
            >
              Classification
            </label>
            <select
              id="wl-tag"
              value={tag}
              onChange={(e) =>
                setTag(e.target.value as Variant_avoid_safe_unknown)
              }
              data-ocid="watchlist.select"
              className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#EDEDED] focus:border-[#C9A95C] focus:outline-none tracking-wide"
            >
              <option value={Variant_avoid_safe_unknown.safe}>SAFE</option>
              <option value={Variant_avoid_safe_unknown.unknown_}>
                UNKNOWN
              </option>
              <option value={Variant_avoid_safe_unknown.avoid}>AVOID</option>
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="wl-notes"
            className="text-[10px] tracking-widest uppercase text-[#8A8A8A] block mb-1.5"
          >
            Intelligence Notes
          </label>
          <textarea
            id="wl-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Behavioral observations, context, interaction details..."
            rows={3}
            data-ocid="watchlist.textarea"
            className="w-full bg-[#0F0F0F] border border-[#2A2A2A] rounded px-3 py-2 text-sm text-[#EDEDED] placeholder-[#4A4A4A] focus:border-[#C9A95C] focus:outline-none tracking-wide resize-none"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!name.trim() || isAdding}
          data-ocid="watchlist.add_button"
          className="flex items-center gap-2 px-6 py-2.5 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-widest uppercase font-bold hover:bg-[#E8C878] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? "ADDING..." : "ADD TO WATCHLIST"}
        </button>
      </div>

      <div className="space-y-3" data-ocid="watchlist.list">
        <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A]">
          {watchlist.length} CONTACT{watchlist.length !== 1 ? "S" : ""}{" "}
          MONITORED
        </div>
        {watchlist.length === 0 ? (
          <div
            className="card-blackgrid text-center py-10"
            data-ocid="watchlist.empty_state"
          >
            <div className="text-[#8A8A8A] text-sm tracking-wider">
              No contacts in watchlist.
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {watchlist.map((entry, i) => {
              const cfg =
                TAG_CONFIG[entry.tag] ??
                TAG_CONFIG[Variant_avoid_safe_unknown.unknown_];
              return (
                <motion.div
                  key={entry.id.toString()}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  data-ocid={`watchlist.item.${i + 1}`}
                  className="flex items-start gap-4 p-4 rounded border"
                  style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
                >
                  <cfg.Icon
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    style={{ color: cfg.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold tracking-wider uppercase text-[#EDEDED]">
                        {entry.targetName}
                      </span>
                      <span
                        className="px-2 py-0.5 text-[9px] tracking-widest uppercase font-bold rounded"
                        style={{
                          color: cfg.color,
                          border: `1px solid ${cfg.color}22`,
                          backgroundColor: `${cfg.color}11`,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-[#8A8A8A] leading-relaxed line-clamp-2">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(entry.id)}
                    data-ocid={`watchlist.delete_button.${i + 1}`}
                    className="flex-shrink-0 p-2 text-[#4A4A4A] hover:text-[#C00000] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
