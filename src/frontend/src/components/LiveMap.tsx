const THREAT_DOTS = [
  { x: 18, y: 25, color: "#C00000", label: "danger-mission" },
  { x: 32, y: 45, color: "#C00000", label: "danger-soma" },
  { x: 55, y: 20, color: "#D8B84A", label: "unknown-nob" },
  { x: 72, y: 38, color: "#D8B84A", label: "unknown-haight" },
  { x: 48, y: 60, color: "#2ECC71", label: "verified-center" },
  { x: 65, y: 72, color: "#2ECC71", label: "verified-excelsior" },
  { x: 25, y: 70, color: "#C00000", label: "danger-tenderloin" },
  { x: 85, y: 55, color: "#2ECC71", label: "verified-richmond" },
  { x: 40, y: 82, color: "#D8B84A", label: "unknown-bayview" },
  { x: 78, y: 85, color: "#2ECC71", label: "verified-sunset" },
  { x: 12, y: 55, color: "#C00000", label: "danger-western" },
  { x: 58, y: 42, color: "#D8B84A", label: "unknown-castro" },
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

export default function LiveMap() {
  return (
    <div
      className="card-blackgrid border-gold gold-glow"
      data-ocid="live_map.card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#C00000] animate-pulse-glow" />
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

      <div
        className="relative w-full rounded overflow-hidden"
        style={{ paddingBottom: "42%" }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Live threat grid map of San Francisco"
        >
          <title>Live Threat Grid — San Francisco</title>
          <rect width="100" height="100" fill="#0A0A0A" />
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
          <rect
            x="5"
            y="25"
            width="30"
            height="16"
            fill="#7A0000"
            fillOpacity="0.2"
          />
          <rect
            x="5"
            y="48"
            width="18"
            height="20"
            fill="#7A0000"
            fillOpacity="0.15"
          />
          {THREAT_DOTS.map((dot) => (
            <g key={dot.label}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r="1.5"
                fill={dot.color}
                opacity="0.3"
              />
              <circle cx={dot.x} cy={dot.y} r="0.8" fill={dot.color} />
            </g>
          ))}
          <polyline
            points="50,95 52,80 55,65 60,50 65,38 70,28"
            stroke="#C9A95C"
            strokeWidth="0.6"
            fill="none"
            strokeDasharray="2,1"
            strokeOpacity="0.6"
          />

          {/* Street name labels */}
          <text
            x="30"
            y="72"
            fill="#C9A95C"
            opacity="0.55"
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
            opacity="0.55"
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
            opacity="0.55"
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
            opacity="0.55"
            fontSize="2.8"
            fontFamily="monospace"
          >
            Howard St
          </text>
          <text
            x="45"
            y="67"
            fill="#C9A95C"
            opacity="0.55"
            fontSize="2.8"
            fontFamily="monospace"
          >
            Folsom St
          </text>
          <text
            x="55"
            y="50"
            fill="#C9A95C"
            opacity="0.55"
            fontSize="2.8"
            fontFamily="monospace"
            transform="rotate(-90, 55, 50)"
          >
            7th St
          </text>
          <text
            x="65"
            y="30"
            fill="#C9A95C"
            opacity="0.55"
            fontSize="2.8"
            fontFamily="monospace"
          >
            Geary Blvd
          </text>
          <text
            x="72"
            y="38"
            fill="#C9A95C"
            opacity="0.55"
            fontSize="2.8"
            fontFamily="monospace"
            transform="rotate(-90, 72, 38)"
          >
            Divisadero St
          </text>

          {/* Safe Route legend */}
          <text
            x="51"
            y="90"
            fill="#C9A95C"
            opacity="0.8"
            fontSize="2.5"
            fontFamily="monospace"
            fontWeight="bold"
          >
            SAFE ROUTE →
          </text>
        </svg>
      </div>

      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C00000]" />
          <span className="text-[10px] tracking-wider uppercase text-[#B8B8B8]">
            Risk Zones
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#D8B84A]" />
          <span className="text-[10px] tracking-wider uppercase text-[#B8B8B8]">
            Unknown
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2ECC71]" />
          <span className="text-[10px] tracking-wider uppercase text-[#B8B8B8]">
            Verified
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-px border-t border-dashed border-[#C9A95C]" />
          <span className="text-[10px] tracking-wider uppercase text-[#C9A95C]">
            Safe Route
          </span>
        </div>
      </div>
    </div>
  );
}
