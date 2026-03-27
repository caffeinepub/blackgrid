import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Shield, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

type Availability = "available" | "on_duty" | "unavailable";
type Specialization =
  | "CLOSE PROTECTION"
  | "EXECUTIVE ESCORT"
  | "EVENT SECURITY"
  | "THREAT ASSESSMENT"
  | "RESIDENTIAL SECURITY"
  | "MOBILE PATROL";

type FilterOption =
  | "ALL"
  | "AVAILABLE NOW"
  | "CLOSE PROTECTION"
  | "EVENT SECURITY";

interface Guard {
  id: number;
  name: string;
  specialization: Specialization;
  rate: string;
  rating: number;
  reviewCount: number;
  distance: string;
  availability: Availability;
  phone: string;
  signal: string;
  bio: string;
  yearsExp: number;
  mapX: number;
  mapY: number;
}

const GUARDS: Guard[] = [
  {
    id: 1,
    name: "Marcus T.",
    specialization: "CLOSE PROTECTION",
    rate: "$120/hr",
    rating: 4.9,
    reviewCount: 47,
    distance: "0.4 mi",
    availability: "available",
    phone: "+1 (415) 555-0192",
    signal: "@marcust_security",
    bio: "Former US Secret Service, 12 years close protection for executives and dignitaries across 30+ countries.",
    yearsExp: 12,
    mapX: 48,
    mapY: 52,
  },
  {
    id: 2,
    name: "Devon R.",
    specialization: "EXECUTIVE ESCORT",
    rate: "$95/hr",
    rating: 4.8,
    reviewCount: 32,
    distance: "0.8 mi",
    availability: "available",
    phone: "+1 (415) 555-0247",
    signal: "@devonr_ep",
    bio: "Ex-Navy SEAL, specialized in high-risk executive transport and threat neutralization in urban environments.",
    yearsExp: 9,
    mapX: 55,
    mapY: 45,
  },
  {
    id: 3,
    name: "Alicia M.",
    specialization: "CLOSE PROTECTION",
    rate: "$110/hr",
    rating: 5.0,
    reviewCount: 28,
    distance: "1.2 mi",
    availability: "available",
    phone: "+1 (415) 555-0381",
    signal: "@aliciam_ops",
    bio: "Certified CPO with background in law enforcement. Specialist in female executive and celebrity protection.",
    yearsExp: 8,
    mapX: 42,
    mapY: 58,
  },
  {
    id: 4,
    name: "Jordan K.",
    specialization: "EVENT SECURITY",
    rate: "$75/hr",
    rating: 4.7,
    reviewCount: 61,
    distance: "1.5 mi",
    availability: "on_duty",
    phone: "+1 (415) 555-0419",
    signal: "@jordank_events",
    bio: "10 years event security for private galas, tech summits, and nightlife venues across the Bay Area.",
    yearsExp: 10,
    mapX: 38,
    mapY: 42,
  },
  {
    id: 5,
    name: "Stefan V.",
    specialization: "THREAT ASSESSMENT",
    rate: "$140/hr",
    rating: 4.9,
    reviewCount: 19,
    distance: "2.1 mi",
    availability: "available",
    phone: "+1 (415) 555-0556",
    signal: "@stefanv_intel",
    bio: "Former DIA intelligence analyst. Provides pre-operational threat assessment and risk mitigation planning.",
    yearsExp: 15,
    mapX: 65,
    mapY: 35,
  },
  {
    id: 6,
    name: "Reyna L.",
    specialization: "MOBILE PATROL",
    rate: "$85/hr",
    rating: 4.6,
    reviewCount: 44,
    distance: "0.6 mi",
    availability: "on_duty",
    phone: "+1 (415) 555-0673",
    signal: "@reynal_patrol",
    bio: "SFPD veteran, 8 years patrol. Specializes in residential mobile security sweeps and neighborhood intelligence.",
    yearsExp: 8,
    mapX: 52,
    mapY: 60,
  },
  {
    id: 7,
    name: "Tariq B.",
    specialization: "EVENT SECURITY",
    rate: "$80/hr",
    rating: 4.8,
    reviewCount: 53,
    distance: "1.9 mi",
    availability: "available",
    phone: "+1 (415) 555-0788",
    signal: "@tariqb_secure",
    bio: "Certified event security manager with expertise in crowd control, VIP access management, and crisis response.",
    yearsExp: 7,
    mapX: 30,
    mapY: 55,
  },
  {
    id: 8,
    name: "Cole A.",
    specialization: "RESIDENTIAL SECURITY",
    rate: "$90/hr",
    rating: 4.7,
    reviewCount: 36,
    distance: "3.0 mi",
    availability: "unavailable",
    phone: "+1 (415) 555-0824",
    signal: "@colea_residential",
    bio: "Marine Corps veteran, specialized in estate and residential protection, perimeter security, and access control.",
    yearsExp: 11,
    mapX: 78,
    mapY: 72,
  },
];

const FILTER_OPTIONS: FilterOption[] = [
  "ALL",
  "AVAILABLE NOW",
  "CLOSE PROTECTION",
  "EVENT SECURITY",
];

const CITY_BLOCKS = [
  { x: 5, y: 5, w: 22, h: 14, key: "block-nw1" },
  { x: 30, y: 5, w: 18, h: 10, key: "block-n2" },
  { x: 52, y: 5, w: 25, h: 12, key: "block-ne3" },
  { x: 80, y: 5, w: 15, h: 16, key: "block-ne4" },
  { x: 5, y: 25, w: 30, h: 16, key: "block-w5" },
  { x: 40, y: 22, w: 20, h: 18, key: "block-c6" },
  { x: 65, y: 24, w: 28, h: 14, key: "block-e7" },
  { x: 5, y: 48, w: 18, h: 20, key: "block-sw8" },
  { x: 28, y: 48, w: 22, h: 14, key: "block-s9" },
  { x: 55, y: 45, w: 18, h: 22, key: "block-sc10" },
  { x: 78, y: 45, w: 17, h: 18, key: "block-se11" },
  { x: 5, y: 75, w: 28, h: 18, key: "block-ssw12" },
  { x: 38, y: 70, w: 20, h: 24, key: "block-ss13" },
  { x: 63, y: 72, w: 16, h: 22, key: "block-sse14" },
  { x: 83, y: 70, w: 12, h: 24, key: "block-sse15" },
];

const H_LINES = Array.from({ length: 20 }, (_, i) => ({
  y: i * 5,
  key: `hline-y${i * 5}`,
}));
const V_LINES = Array.from({ length: 20 }, (_, i) => ({
  x: i * 5,
  key: `vline-x${i * 5}`,
}));

function pinColor(availability: Availability): string {
  if (availability === "available") return "#2ECC71";
  if (availability === "on_duty") return "#C9A95C";
  return "#7A0000";
}

function GuardMapPin({
  guard,
  index,
}: {
  guard: Guard;
  index: number;
}) {
  const color = pinColor(guard.availability);
  const isAvailable = guard.availability === "available";

  return (
    <g key={guard.id}>
      {/* Pulsing ring for available guards */}
      {isAvailable && (
        <circle
          cx={guard.mapX}
          cy={guard.mapY}
          r="3"
          fill="none"
          stroke={color}
          strokeWidth="0.4"
          opacity="0.35"
        >
          <animate
            attributeName="r"
            values="2.2;4;2.2"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.5;0;0.5"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}
      {/* Outer glow ring */}
      <circle
        cx={guard.mapX}
        cy={guard.mapY}
        r="2.2"
        fill={color}
        opacity="0.2"
      />
      {/* Pin dot */}
      <circle
        cx={guard.mapX}
        cy={guard.mapY}
        r="1.2"
        fill={color}
        opacity="0.95"
      />
      {/* Number label */}
      <text
        x={guard.mapX + 1.8}
        y={guard.mapY - 1.8}
        fill={color}
        fontSize="2.4"
        fontFamily="monospace"
        fontWeight="bold"
        opacity="0.9"
      >
        {index + 1}
      </text>
    </g>
  );
}

function OperativePositionsMap() {
  return (
    <div data-ocid="guards.map.card">
      {/* Section separator */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex-1 h-px"
          style={{
            background:
              "linear-gradient(to right, rgba(201,169,92,0.4), transparent)",
          }}
        />
        <span
          className="text-[#C9A95C] text-[9px] tracking-[0.3em] uppercase font-bold"
          style={{ letterSpacing: "0.3em" }}
        >
          OPERATIVE GRID
        </span>
        <div
          className="flex-1 h-px"
          style={{
            background:
              "linear-gradient(to left, rgba(201,169,92,0.4), transparent)",
          }}
        />
      </div>

      <div
        className="rounded overflow-hidden"
        style={{
          background: "#0D0D0D",
          border: "1px solid rgba(201,169,92,0.3)",
          boxShadow:
            "0 0 32px rgba(201,169,92,0.06), 0 0 8px rgba(201,169,92,0.04)",
        }}
      >
        {/* Map header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: "1px solid rgba(201,169,92,0.12)" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C00000] animate-pulse" />
            <span className="text-[#EDEDED] text-[10px] tracking-[0.25em] uppercase font-medium">
              OPERATIVE POSITIONS — LIVE
            </span>
            <span className="text-[#C9A95C] text-[10px] tracking-wider">
              | SAN FRANCISCO
            </span>
          </div>
          <span className="text-[9px] tracking-widest text-[#555] uppercase">
            REAL-TIME
          </span>
        </div>

        {/* SVG map */}
        <div className="relative w-full" style={{ paddingBottom: "40%" }}>
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Operative positions map — San Francisco"
          >
            <title>Operative Positions — San Francisco</title>
            {/* Background */}
            <rect width="100" height="100" fill="#0A0A0A" />

            {/* Grid lines */}
            {H_LINES.map((line) => (
              <line
                key={line.key}
                x1="0"
                y1={line.y}
                x2="100"
                y2={line.y}
                stroke="#C9A95C"
                strokeOpacity="0.06"
                strokeWidth="0.2"
              />
            ))}
            {V_LINES.map((line) => (
              <line
                key={line.key}
                x1={line.x}
                y1="0"
                x2={line.x}
                y2="100"
                stroke="#C9A95C"
                strokeOpacity="0.06"
                strokeWidth="0.2"
              />
            ))}

            {/* City blocks */}
            {CITY_BLOCKS.map((block) => (
              <rect
                key={block.key}
                x={block.x}
                y={block.y}
                width={block.w}
                height={block.h}
                fill="#1A1A1A"
                stroke="#2A2A2A"
                strokeWidth="0.3"
              />
            ))}

            {/* Risk zone overlays */}
            <rect
              x="5"
              y="25"
              width="30"
              height="16"
              fill="#7A0000"
              fillOpacity="0.12"
            />
            <rect
              x="5"
              y="48"
              width="18"
              height="20"
              fill="#7A0000"
              fillOpacity="0.1"
            />

            {/* Street labels */}
            <text
              x="30"
              y="72"
              fill="#C9A95C"
              opacity="0.45"
              fontSize="2.8"
              fontFamily="monospace"
              transform="rotate(-30, 30, 72)"
            >
              Market St
            </text>
            <text
              x="28"
              y="78"
              fill="#C9A95C"
              opacity="0.45"
              fontSize="2.8"
              fontFamily="monospace"
              transform="rotate(-30, 28, 78)"
            >
              Mission St
            </text>
            <text
              x="52"
              y="55"
              fill="#C9A95C"
              opacity="0.45"
              fontSize="2.8"
              fontFamily="monospace"
              transform="rotate(-90, 52, 55)"
            >
              Van Ness Ave
            </text>
            <text
              x="40"
              y="62"
              fill="#C9A95C"
              opacity="0.45"
              fontSize="2.8"
              fontFamily="monospace"
            >
              Howard St
            </text>
            <text
              x="65"
              y="30"
              fill="#C9A95C"
              opacity="0.45"
              fontSize="2.8"
              fontFamily="monospace"
            >
              Geary Blvd
            </text>
            <text
              x="72"
              y="38"
              fill="#C9A95C"
              opacity="0.45"
              fontSize="2.8"
              fontFamily="monospace"
              transform="rotate(-90, 72, 38)"
            >
              Divisadero
            </text>

            {/* Guard pins */}
            {GUARDS.map((guard, i) => (
              <GuardMapPin key={guard.id} guard={guard} index={i} />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div
          className="flex items-center gap-6 px-4 py-3"
          style={{ borderTop: "1px solid rgba(201,169,92,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
            <span className="text-[#2ECC71] text-[9px] tracking-widest uppercase">
              Available
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C9A95C]" />
            <span className="text-[#C9A95C] text-[9px] tracking-widest uppercase">
              On Duty
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#7A0000]" />
            <span className="text-[#888] text-[9px] tracking-widest uppercase">
              Offline
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[#444] text-[9px] tracking-widest uppercase">
              {GUARDS.length} OPERATIVES TRACKED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvailabilityDot({ status }: { status: Availability }) {
  if (status === "available") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse inline-block" />
        <span className="text-[#2ECC71] text-[9px] tracking-widest uppercase font-bold">
          AVAILABLE NOW
        </span>
      </span>
    );
  }
  if (status === "on_duty") {
    return (
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[#C9A95C] inline-block" />
        <span className="text-[#C9A95C] text-[9px] tracking-widest uppercase font-bold">
          ON DUTY
        </span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full bg-[#7A0000] inline-block" />
      <span className="text-[#7A0000] text-[9px] tracking-widest uppercase font-bold">
        UNAVAILABLE
      </span>
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <Star className="w-3 h-3 fill-[#C9A95C] text-[#C9A95C]" />
      <span className="text-[#C9A95C] text-xs font-bold">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

function SpecBadge({ spec }: { spec: Specialization }) {
  const colorMap: Record<Specialization, string> = {
    "CLOSE PROTECTION": "rgba(122,0,0,0.35)",
    "EXECUTIVE ESCORT": "rgba(201,169,92,0.2)",
    "EVENT SECURITY": "rgba(46,50,80,0.5)",
    "THREAT ASSESSMENT": "rgba(80,40,10,0.5)",
    "RESIDENTIAL SECURITY": "rgba(20,60,40,0.5)",
    "MOBILE PATROL": "rgba(40,40,80,0.5)",
  };
  const borderMap: Record<Specialization, string> = {
    "CLOSE PROTECTION": "rgba(122,0,0,0.8)",
    "EXECUTIVE ESCORT": "rgba(201,169,92,0.6)",
    "EVENT SECURITY": "rgba(100,120,220,0.5)",
    "THREAT ASSESSMENT": "rgba(200,100,20,0.5)",
    "RESIDENTIAL SECURITY": "rgba(46,180,80,0.4)",
    "MOBILE PATROL": "rgba(80,80,200,0.5)",
  };
  return (
    <span
      className="inline-block px-2 py-0.5 text-[8px] tracking-widest uppercase font-bold"
      style={{
        background: colorMap[spec],
        border: `1px solid ${borderMap[spec]}`,
        color: "#DDDDDD",
      }}
    >
      {spec}
    </span>
  );
}

interface HireFormState {
  date: string;
  duration: string;
  description: string;
}

function HireModal({
  guard,
  open,
  onClose,
}: {
  guard: Guard | null;
  open: boolean;
  onClose: () => void;
}) {
  const [form, setForm] = useState<HireFormState>({
    date: "",
    duration: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ date: "", duration: "", description: "" });
    onClose();
  };

  if (!guard) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden"
        style={{
          background: "#0D0D0D",
          border: "1px solid rgba(201,169,92,0.35)",
          boxShadow:
            "0 0 48px rgba(201,169,92,0.1), 0 0 8px rgba(201,169,92,0.06)",
        }}
        data-ocid="guards.dialog"
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid rgba(201,169,92,0.15)" }}
        >
          <DialogHeader>
            <DialogTitle asChild>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-[#C9A95C]" />
                  <span className="text-[#C9A95C] text-xs tracking-[0.25em] uppercase font-bold">
                    BLACKGRID GUARD NETWORK
                  </span>
                </div>
                <h2 className="text-white text-xl font-bold tracking-wide">
                  {guard.name}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <SpecBadge spec={guard.specialization} />
                  <AvailabilityDot status={guard.availability} />
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6 py-4 space-y-5">
          {/* Bio */}
          <p className="text-[#888] text-xs leading-relaxed tracking-wide">
            {guard.bio}
          </p>

          {/* Contact info */}
          <div
            className="p-4 space-y-2"
            style={{
              background: "rgba(201,169,92,0.05)",
              border: "1px solid rgba(201,169,92,0.15)",
            }}
          >
            <p className="text-[#C9A95C] text-[9px] tracking-[0.3em] uppercase font-bold mb-3">
              SECURE CONTACT
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[#555] text-[9px] tracking-widest uppercase w-16">
                PHONE
              </span>
              <span className="text-[#DDDDDD] text-xs font-mono">
                {guard.phone}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#555] text-[9px] tracking-widest uppercase w-16">
                SIGNAL
              </span>
              <span className="text-[#DDDDDD] text-xs font-mono">
                {guard.signal}
              </span>
            </div>
          </div>

          {/* Hire form or success */}
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6"
              data-ocid="guards.success_state"
            >
              <CheckCircle className="w-10 h-10 text-[#2ECC71]" />
              <p className="text-[#2ECC71] text-sm tracking-[0.2em] uppercase font-bold text-center">
                REQUEST SENT
              </p>
              <p className="text-[#888] text-xs tracking-wide text-center">
                Guard will confirm within 15 minutes
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 px-6 py-2 text-[#C9A95C] text-[9px] tracking-widest uppercase border border-[#C9A95C] hover:bg-[#C9A95C] hover:text-[#0A0A0A] transition-all"
                data-ocid="guards.close_button"
              >
                CLOSE
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-[#C9A95C] text-[9px] tracking-[0.3em] uppercase font-bold">
                SEND HIRE REQUEST
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="hire-date"
                    className="text-[#666] text-[9px] tracking-widest uppercase"
                  >
                    DATE
                  </Label>
                  <Input
                    id="hire-date"
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date: e.target.value }))
                    }
                    data-ocid="guards.input"
                    className="bg-transparent border-[rgba(201,169,92,0.25)] text-[#DDD] text-xs focus:border-[#C9A95C] focus:ring-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="hire-duration"
                    className="text-[#666] text-[9px] tracking-widest uppercase"
                  >
                    DURATION (HRS)
                  </Label>
                  <Input
                    id="hire-duration"
                    type="number"
                    min="1"
                    max="24"
                    placeholder="e.g. 4"
                    required
                    value={form.duration}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, duration: e.target.value }))
                    }
                    data-ocid="guards.input"
                    className="bg-transparent border-[rgba(201,169,92,0.25)] text-[#DDD] text-xs placeholder:text-[#444] focus:border-[#C9A95C] focus:ring-0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="hire-desc"
                  className="text-[#666] text-[9px] tracking-widest uppercase"
                >
                  DESCRIPTION OF NEED
                </Label>
                <Textarea
                  id="hire-desc"
                  required
                  placeholder="Describe the security requirement, location, and any specific concerns..."
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  data-ocid="guards.textarea"
                  className="bg-transparent border-[rgba(201,169,92,0.25)] text-[#DDD] text-xs placeholder:text-[#444] focus:border-[#C9A95C] focus:ring-0 resize-none"
                />
              </div>
              <button
                type="submit"
                data-ocid="guards.submit_button"
                className="w-full py-3 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-[0.25em] uppercase font-bold hover:bg-[#E8C878] transition-all"
              >
                SEND HIRE REQUEST — {guard.rate}
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GuardCard({
  guard,
  index,
  onHire,
}: {
  guard: Guard;
  index: number;
  onHire: (guard: Guard) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      data-ocid={`guards.item.${index + 1}`}
      className="flex flex-col justify-between"
      style={{
        background: "#0D0D0D",
        border: "1px solid rgba(201,169,92,0.2)",
        boxShadow: "0 0 16px rgba(201,169,92,0.04)",
      }}
    >
      <div className="p-5 space-y-3">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white text-base font-bold tracking-wide">
                {guard.name}
              </span>
              <CheckCircle className="w-3.5 h-3.5 text-[#C9A95C] flex-shrink-0" />
            </div>
            <p className="text-[#555] text-[9px] tracking-widest uppercase mt-0.5">
              {guard.yearsExp} YRS EXP · {guard.distance}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[#C9A95C] text-sm font-bold tracking-wide">
              {guard.rate}
            </p>
            <StarRating rating={guard.rating} />
          </div>
        </div>

        {/* Spec badge */}
        <div>
          <SpecBadge spec={guard.specialization} />
        </div>

        {/* Availability */}
        <AvailabilityDot status={guard.availability} />

        {/* Bio */}
        <p className="text-[#666] text-[11px] leading-relaxed line-clamp-2">
          {guard.bio}
        </p>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <button
          type="button"
          onClick={() => onHire(guard)}
          disabled={guard.availability === "unavailable"}
          data-ocid={`guards.primary_button.${index + 1}`}
          className="w-full py-2.5 text-[9px] tracking-[0.25em] uppercase font-bold transition-all"
          style={{
            background:
              guard.availability === "unavailable"
                ? "transparent"
                : "rgba(201,169,92,0.1)",
            border:
              guard.availability === "unavailable"
                ? "1px solid rgba(122,0,0,0.4)"
                : "1px solid rgba(201,169,92,0.5)",
            color: guard.availability === "unavailable" ? "#4A2020" : "#C9A95C",
            cursor:
              guard.availability === "unavailable" ? "not-allowed" : "pointer",
          }}
        >
          {guard.availability === "unavailable"
            ? "UNAVAILABLE"
            : "CONTACT & HIRE"}
        </button>
      </div>
    </motion.div>
  );
}

export default function BodyguardDirectory() {
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);
  const [filter, setFilter] = useState<FilterOption>("ALL");

  const filteredGuards = GUARDS.filter((g) => {
    if (filter === "ALL") return true;
    if (filter === "AVAILABLE NOW") return g.availability === "available";
    if (filter === "CLOSE PROTECTION")
      return g.specialization === "CLOSE PROTECTION";
    if (filter === "EVENT SECURITY")
      return g.specialization === "EVENT SECURITY";
    return true;
  });

  return (
    <div className="space-y-8" data-ocid="guards.section">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-[#C9A95C]" />
          <h1
            className="text-[#C9A95C] text-xl font-bold uppercase"
            style={{ letterSpacing: "0.25em" }}
          >
            BLACKGRID GUARD NETWORK
          </h1>
        </div>
        <p className="text-[#666] text-xs tracking-widest uppercase">
          Vetted freelance protection operatives — San Francisco Metro
        </p>
        <div
          className="mt-1 h-px w-24"
          style={{
            background: "linear-gradient(to right, #C9A95C, transparent)",
          }}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2" data-ocid="guards.tab">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setFilter(opt)}
            data-ocid={`guards.${opt.replace(/ /g, "_").toLowerCase()}.toggle`}
            className="px-4 py-1.5 text-[9px] tracking-widest uppercase transition-all"
            style={{
              background:
                filter === opt ? "rgba(201,169,92,0.15)" : "transparent",
              border:
                filter === opt
                  ? "1px solid rgba(201,169,92,0.6)"
                  : "1px solid rgba(201,169,92,0.2)",
              color: filter === opt ? "#C9A95C" : "#666",
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
          <span className="text-[#2ECC71] text-[9px] tracking-widest uppercase">
            {GUARDS.filter((g) => g.availability === "available").length}{" "}
            AVAILABLE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A95C]" />
          <span className="text-[#C9A95C] text-[9px] tracking-widest uppercase">
            {GUARDS.filter((g) => g.availability === "on_duty").length} ON DUTY
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A0000]" />
          <span className="text-[#888] text-[9px] tracking-widest uppercase">
            {GUARDS.filter((g) => g.availability === "unavailable").length}{" "}
            OFFLINE
          </span>
        </div>
      </div>

      {/* Operative Positions Map */}
      <OperativePositionsMap />

      {/* Guard grid */}
      {filteredGuards.length === 0 ? (
        <div
          className="flex items-center justify-center py-16"
          data-ocid="guards.empty_state"
        >
          <p className="text-[#444] text-xs tracking-widest uppercase">
            NO OPERATIVES MATCH THIS FILTER
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredGuards.map((guard, i) => (
            <GuardCard
              key={guard.id}
              guard={guard}
              index={i}
              onHire={setSelectedGuard}
            />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[#333] text-[9px] tracking-widest uppercase text-center pb-4">
        All operatives are independently verified through BLACKGRID's vetting
        protocol. BLACKGRID is a directory service — all contracts are between
        client and operative.
      </p>

      {/* Hire Modal */}
      <HireModal
        guard={selectedGuard}
        open={!!selectedGuard}
        onClose={() => setSelectedGuard(null)}
      />
    </div>
  );
}
