import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tool = "breach" | "ipdomain" | "entity" | "threats" | "report";

interface CacheEntry<T> {
  data: T;
  fetchedAt: string;
}

interface HibpBreach {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  PwnCount: number;
  Description: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsSensitive: boolean;
}

interface IPInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
  timezone?: string;
  loc?: string;
  hostname?: string;
  postal?: string;
  error?: string;
}

interface WhoisData {
  domain?: string;
  registrar?: string;
  creation_date?: string;
  expiration_date?: string;
  updated_date?: string;
  status?: string | string[];
  name_servers?: string[];
  emails?: string | string[];
  dnssec?: string;
  country?: string;
  error?: string;
}

interface WikiSummary {
  type: string;
  title: string;
  extract: string;
  thumbnail?: { source: string };
  content_urls?: { desktop: { page: string } };
}

interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  author?: string;
  description?: string;
  source?: string;
}

interface ThreatItem {
  title: string;
  pubDate: string;
  link: string;
  description?: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  source: string;
}

interface SFIncident {
  incident_datetime?: string;
  incident_description?: string;
  incident_category?: string;
  police_district?: string;
  resolution?: string;
}

interface BreachResult {
  allBreaches: HibpBreach[];
  matchedBreaches: HibpBreach[];
  isEmail: boolean;
  query: string;
  isLive: boolean;
  cacheDate?: string;
  error?: string;
}

interface IPDomainResult {
  query: string;
  isIP: boolean;
  ipData?: IPInfo;
  whoisData?: WhoisData;
  isLive: boolean;
  cacheDate?: string;
  error?: string;
}

interface EntityResult {
  query: string;
  wiki?: WikiSummary;
  news: NewsItem[];
  exposureScore: number;
  isLive: boolean;
  cacheDate?: string;
  error?: string;
}

interface ThreatsResult {
  sfIncidents: ThreatItem[];
  cyberThreats: ThreatItem[];
  isLive: boolean;
  cacheDate?: string;
  error?: string;
}

interface ReportFinding {
  tool: string;
  subject: string;
  summary: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dataPoints: string[];
  timestamp: string;
}

// ─── Cache Helpers ────────────────────────────────────────────────────────────

function cacheGet<T>(key: string, ttlMs: number): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(`osiris_cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    const age = Date.now() - new Date(entry.fetchedAt).getTime();
    if (age > ttlMs) return null;
    return entry;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(
      `osiris_cache_${key}`,
      JSON.stringify({ data, fetchedAt: new Date().toISOString() }),
    );
  } catch {
    /* storage full */
  }
}

const TTL_24H = 24 * 60 * 60 * 1000;
const TTL_1H = 60 * 60 * 1000;

function formatTs(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Severity classifier ──────────────────────────────────────────────────────

function classifySeverity(
  text: string,
): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const t = text.toLowerCase();
  if (
    /critical|zero.?day|ransomware|breach|exploit|attack|hacked|vuln/i.test(t)
  )
    return "CRITICAL";
  if (/malware|phishing|fraud|scam|theft|robbery|assault|shooting/i.test(t))
    return "HIGH";
  if (/burglary|suspicious|threat|warrant|suspect/i.test(t)) return "MEDIUM";
  return "LOW";
}

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "#00ff41",
  MEDIUM: "#ffcc00",
  HIGH: "#ff8800",
  CRITICAL: "#ff2200",
};

// ─── API Functions ────────────────────────────────────────────────────────────

async function fetchHIBP(query: string): Promise<BreachResult> {
  const ck = `breach_${query.toLowerCase()}`;
  const cached = cacheGet<HibpBreach[]>("hibp_all", TTL_24H);
  let allBreaches: HibpBreach[] = [];
  let isLive = false;
  let cacheDate: string | undefined;

  if (cached) {
    allBreaches = cached.data;
    cacheDate = formatTs(cached.fetchedAt);
  } else {
    try {
      const res = await fetch("https://haveibeenpwned.com/api/v3/breaches", {
        headers: { "User-Agent": "OSIRIS-OSINT-Platform" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      allBreaches = await res.json();
      cacheSet("hibp_all", allBreaches);
      isLive = true;
    } catch (err) {
      return {
        allBreaches: [],
        matchedBreaches: [],
        isEmail: query.includes("@"),
        query,
        isLive: false,
        error: `[CONNECTION FAILED — HIBP SOURCE UNAVAILABLE: ${err instanceof Error ? err.message : String(err)}]`,
      };
    }
  }

  const isEmail = query.includes("@");
  let matchedBreaches: HibpBreach[] = [];

  if (isEmail) {
    const domain = query.split("@")[1]?.toLowerCase() ?? "";
    matchedBreaches = allBreaches.filter(
      (b) => b.Domain?.toLowerCase() === domain,
    );
  } else {
    // Search by name or domain
    const q = query.toLowerCase();
    matchedBreaches = allBreaches.filter(
      (b) =>
        b.Name?.toLowerCase().includes(q) ||
        b.Title?.toLowerCase().includes(q) ||
        b.Domain?.toLowerCase().includes(q),
    );
  }

  // Cache individual query result
  cacheSet(ck, { allBreaches, matchedBreaches, isEmail });

  return {
    allBreaches,
    matchedBreaches,
    isEmail,
    query,
    isLive: isLive || !!cached,
    cacheDate,
  };
}

async function fetchIPDomain(query: string): Promise<IPDomainResult> {
  const ck = `ipdomain_${query.toLowerCase()}`;
  const cached = cacheGet<IPDomainResult>(ck, TTL_24H);
  if (cached)
    return {
      ...cached.data,
      isLive: false,
      cacheDate: formatTs(cached.fetchedAt),
    };

  const isIP = /^(\d{1,3}\.){3}\d{1,3}$/.test(query.trim());
  const result: IPDomainResult = { query, isIP, isLive: true };

  try {
    if (isIP) {
      const res = await fetch(
        `https://ipinfo.io/${encodeURIComponent(query.trim())}/json`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: IPInfo = await res.json();
      result.ipData = data;
    } else {
      // Try as domain — get IP first, then whois
      const domainClean = query
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "")
        .trim();
      const [ipRes, whoisRes] = await Promise.allSettled([
        fetch(`https://ipinfo.io/${encodeURIComponent(domainClean)}/json`),
        fetch(
          `https://api.whoisjson.com/v1/${encodeURIComponent(domainClean)}`,
        ),
      ]);

      if (ipRes.status === "fulfilled" && ipRes.value.ok) {
        result.ipData = await ipRes.value.json();
      }
      if (whoisRes.status === "fulfilled" && whoisRes.value.ok) {
        result.whoisData = await whoisRes.value.json();
      }
    }
    cacheSet(ck, result);
  } catch (err) {
    result.error = `[CONNECTION FAILED — SOURCE UNAVAILABLE: ${err instanceof Error ? err.message : String(err)}]`;
    result.isLive = false;
  }

  return result;
}

async function fetchEntity(query: string): Promise<EntityResult> {
  const ck = `entity_${query.toLowerCase()}`;
  const cached = cacheGet<EntityResult>(ck, TTL_24H);
  if (cached)
    return {
      ...cached.data,
      isLive: false,
      cacheDate: formatTs(cached.fetchedAt),
    };

  let wiki: WikiSummary | undefined;
  let news: NewsItem[] = [];
  let error: string | undefined;

  const [wikiRes, newsRes] = await Promise.allSettled([
    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`,
    ),
    fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`)}`,
    ),
  ]);

  if (wikiRes.status === "fulfilled" && wikiRes.value.ok) {
    const json: WikiSummary = await wikiRes.value.json();
    if (json.type === "standard") wiki = json;
  }

  if (newsRes.status === "fulfilled" && newsRes.value.ok) {
    const json = await newsRes.value.json();
    if (json.status === "ok" && Array.isArray(json.items)) {
      news = (json.items as NewsItem[]).slice(0, 8);
    }
  }

  if (!wiki && news.length === 0) {
    error = "[NO DATA FOUND — SOURCE OFFLINE OR QUERY RETURNED NULL]";
  }

  // Calculate exposure score: wiki (+40) + news hits × 5 (max 40) + domain guess (+20)
  const wikiScore = wiki ? 40 : 0;
  const newsScore = Math.min(news.length * 5, 40);
  const domainScore = news.length > 0 || wiki ? 20 : 0;
  const exposureScore = wikiScore + newsScore + domainScore;

  const result: EntityResult = {
    query,
    wiki,
    news,
    exposureScore,
    isLive: true,
    error,
  };
  if (!error) cacheSet(ck, result);

  return result;
}

async function fetchThreats(): Promise<ThreatsResult> {
  const ck = "threats_feed";
  const cached = cacheGet<ThreatsResult>(ck, TTL_1H);
  if (cached)
    return {
      ...cached.data,
      isLive: false,
      cacheDate: formatTs(cached.fetchedAt),
    };

  let sfIncidents: ThreatItem[] = [];
  let cyberThreats: ThreatItem[] = [];
  let error: string | undefined;

  const [sfRes, cyberRes] = await Promise.allSettled([
    fetch(
      "https://data.sfgov.org/resource/wg3w-h783.json?$limit=15&$order=incident_datetime%20DESC",
    ),
    fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent("https://feeds.feedburner.com/TheHackersNews")}`,
    ),
  ]);

  if (sfRes.status === "fulfilled" && sfRes.value.ok) {
    const data: SFIncident[] = await sfRes.value.json();
    sfIncidents = data.map((d) => ({
      title: `${d.incident_category || "INCIDENT"}: ${d.incident_description || "N/A"}`,
      pubDate: d.incident_datetime || new Date().toISOString(),
      link: "https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783",
      description: `District: ${d.police_district || "Unknown"} — Resolution: ${d.resolution || "Pending"}`,
      severity: classifySeverity(
        (d.incident_description || "") + (d.incident_category || ""),
      ),
      source: "SF OpenData",
    }));
  }

  if (cyberRes.status === "fulfilled" && cyberRes.value.ok) {
    const json = await cyberRes.value.json();
    if (json.status === "ok" && Array.isArray(json.items)) {
      cyberThreats = (json.items as NewsItem[]).slice(0, 10).map((item) => ({
        ...item,
        severity: classifySeverity(item.title + (item.description || "")),
        source: "The Hacker News",
      }));
    }
  }

  if (sfIncidents.length === 0 && cyberThreats.length === 0) {
    error = "[NO DATA FOUND — SOURCE OFFLINE OR QUERY RETURNED NULL]";
  }

  const result: ThreatsResult = {
    sfIncidents,
    cyberThreats,
    isLive: true,
    error,
  };
  if (!error) cacheSet(ck, result);

  return result;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingLoader({ label = "QUERYING SOURCE" }: { label?: string }) {
  const [dots, setDots] = useState("▋");
  useEffect(() => {
    const frames = ["▋", "▌▋", "▍▌▋", "▎▍▌▋"];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % frames.length;
      setDots(frames[i]);
    }, 180);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="py-8 text-center">
      <div className="text-xs tracking-[0.3em]" style={{ color: "#00ff41" }}>
        {label}...{dots}
      </div>
    </div>
  );
}

function LiveBadge({
  isLive,
  cacheDate,
}: { isLive: boolean; cacheDate?: string }) {
  return (
    <span
      className="text-[8px] tracking-widest px-1.5 py-0.5 ml-2"
      style={{
        color: isLive ? "#00ff41" : "#aa8800",
        border: `1px solid ${isLive ? "#00ff41" : "#aa8800"}`,
      }}
    >
      {isLive ? "⚡ LIVE" : `📦 CACHED ${cacheDate || ""}`}
    </span>
  );
}

function ErrorPanel({
  message,
  onRetry,
}: { message: string; onRetry?: () => void }) {
  return (
    <div
      className="py-6 px-4"
      style={{ border: "1px solid #330000", backgroundColor: "#0a0000" }}
    >
      <div
        className="text-[9px] tracking-widest mb-3"
        style={{ color: "#ff2200" }}
      >
        {message}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-[8px] tracking-widest px-3 py-1.5 transition-all"
          style={{ color: "#00ff41", border: "1px solid #00ff41" }}
          data-ocid="osint.secondary_button"
        >
          ↻ RETRY CONNECTION
        </button>
      )}
    </div>
  );
}

function SectionHeader({
  label,
  badge,
}: { label: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="text-[9px] tracking-[0.4em]" style={{ color: "#00aa2a" }}>
        {label}
      </div>
      {badge}
    </div>
  );
}

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3" style={{ border: "1px solid #001500" }}>
      <div
        className="text-[7px] tracking-widest mb-1"
        style={{ color: "#00661a" }}
      >
        {label}
      </div>
      <div
        className="text-xs break-all"
        style={{ color: value ? "#00ff41" : "#003300" }}
      >
        {value || "████ NULL"}
      </div>
    </div>
  );
}

interface ReportPanelProps {
  breachResult: BreachResult | null;
  ipResult: IPDomainResult | null;
  entityResult: EntityResult | null;
  threatResult: ThreatsResult | null;
}

function ReportPanel({
  breachResult,
  ipResult,
  entityResult,
  threatResult,
}: ReportPanelProps) {
  const [reportText, setReportText] = useState("");
  const [copied, setCopied] = useState(false);

  const generateReport = useCallback(() => {
    const ts = new Date().toISOString();
    const findings: ReportFinding[] = [];

    if (breachResult && !breachResult.error) {
      findings.push({
        tool: "BREACH INTELLIGENCE",
        subject: breachResult.query,
        summary:
          breachResult.matchedBreaches.length > 0
            ? `COMPROMISED — ${breachResult.matchedBreaches.length} breach(es) found`
            : `CLEAN — No direct matches in ${breachResult.allBreaches.length} known breaches`,
        riskLevel:
          breachResult.matchedBreaches.length > 3
            ? "CRITICAL"
            : breachResult.matchedBreaches.length > 0
              ? "HIGH"
              : "LOW",
        dataPoints: breachResult.matchedBreaches
          .slice(0, 5)
          .map(
            (b) =>
              `${b.Title || b.Name} (${b.BreachDate}) — ${(b.DataClasses || []).join(", ")}`,
          ),
        timestamp: ts,
      });
    }

    if (ipResult && (ipResult.ipData || ipResult.whoisData)) {
      findings.push({
        tool: "IP/DOMAIN INTELLIGENCE",
        subject: ipResult.query,
        summary: ipResult.ipData
          ? `Host: ${ipResult.ipData.city || ""}, ${ipResult.ipData.country || ""} — ${ipResult.ipData.org || ""}`
          : `Domain registered via ${ipResult.whoisData?.registrar || "unknown registrar"}`,
        riskLevel: "LOW",
        dataPoints: [
          ipResult.ipData?.ip ? `IP: ${ipResult.ipData.ip}` : "",
          ipResult.ipData?.org ? `ORG: ${ipResult.ipData.org}` : "",
          ipResult.whoisData?.registrar
            ? `REGISTRAR: ${ipResult.whoisData.registrar}`
            : "",
          ipResult.whoisData?.creation_date
            ? `CREATED: ${ipResult.whoisData.creation_date}`
            : "",
        ].filter(Boolean),
        timestamp: ts,
      });
    }

    if (entityResult && (entityResult.wiki || entityResult.news.length > 0)) {
      const score = entityResult.exposureScore;
      findings.push({
        tool: "ENTITY INTELLIGENCE",
        subject: entityResult.query,
        summary: `Exposure Score: ${score}/100 — ${entityResult.wiki ? "Wikipedia profile found" : "No Wikipedia profile"} — ${entityResult.news.length} news articles`,
        riskLevel:
          score >= 80
            ? "CRITICAL"
            : score >= 60
              ? "HIGH"
              : score >= 40
                ? "MEDIUM"
                : "LOW",
        dataPoints: [
          entityResult.wiki
            ? `Wikipedia: ${entityResult.wiki.title}`
            : "No Wikipedia profile",
          ...entityResult.news
            .slice(0, 3)
            .map((n) => `NEWS: ${n.title.substring(0, 80)}`),
        ],
        timestamp: ts,
      });
    }

    if (
      threatResult &&
      (threatResult.cyberThreats.length > 0 ||
        threatResult.sfIncidents.length > 0)
    ) {
      findings.push({
        tool: "THREAT FEED",
        subject: "LIVE INTELLIGENCE",
        summary: `${threatResult.cyberThreats.length} cyber threats | ${threatResult.sfIncidents.length} SF incidents`,
        riskLevel: threatResult.cyberThreats.some(
          (t) => t.severity === "CRITICAL",
        )
          ? "CRITICAL"
          : "MEDIUM",
        dataPoints: [
          ...threatResult.cyberThreats
            .slice(0, 3)
            .map((t) => `[${t.severity}] ${t.title.substring(0, 80)}`),
          ...threatResult.sfIncidents
            .slice(0, 2)
            .map((t) => `[SF] ${t.title.substring(0, 80)}`),
        ],
        timestamp: ts,
      });
    }

    if (findings.length === 0) {
      setReportText(
        "[NO FINDINGS — RUN ONE OR MORE TOOLS BEFORE GENERATING A REPORT]",
      );
      return;
    }

    const overallRisk = findings.reduce((worst, f) => {
      const levels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
      return levels.indexOf(f.riskLevel) > levels.indexOf(worst)
        ? f.riskLevel
        : worst;
    }, "LOW" as string);

    const lines = [
      "████████████████████████████████████████████████████████████",
      "█                                                          █",
      "█          ◈ OSIRIS INTELLIGENCE REPORT ◈                  █",
      "█   OPERATIONAL SIGNAL INTELLIGENCE & RECONNAISSANCE       █",
      "█                                                          █",
      "████████████████████████████████████████████████████████████",
      "",
      "CLASSIFICATION: TOP SECRET // ELITE+",
      `GENERATED: ${new Date(ts).toLocaleString()}`,
      `REPORT ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      `OVERALL RISK ASSESSMENT: ${overallRisk}`,
      "",
      "══════════════════════════════════════════════════════════",
      "",
      ...findings.flatMap((f, i) => [
        `[${String(i + 1).padStart(2, "0")}] ${f.tool}`,
        `SUBJECT   : ${f.subject}`,
        `SUMMARY   : ${f.summary}`,
        `RISK LEVEL: ${f.riskLevel}`,
        `TIMESTAMP : ${new Date(f.timestamp).toLocaleString()}`,
        "KEY FINDINGS:",
        ...f.dataPoints.map((d) => `  • ${d}`),
        "",
        "──────────────────────────────────────────────────────────",
        "",
      ]),
      "[END OF REPORT] [BLACKGRID OSIRIS DIVISION]",
      "[ALL DATA SOURCED FROM PUBLIC APIs — FOR AUTHORIZED USE ONLY]",
    ];

    setReportText(lines.join("\n"));
  }, [breachResult, ipResult, entityResult, threatResult]);

  const copyReport = () => {
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const hasSomething = !!(
    breachResult ||
    ipResult ||
    entityResult ||
    threatResult
  );

  return (
    <div className="space-y-4">
      <SectionHeader label="◈ OSINT SUMMARY REPORT GENERATOR" />
      <div className="text-[8px] tracking-wider" style={{ color: "#00661a" }}>
        AGGREGATES ALL TOOL RESULTS INTO A CLASSIFIED INTELLIGENCE REPORT. RUN
        BREACH, IP/DOMAIN, ENTITY, AND THREAT TOOLS FIRST TO POPULATE FINDINGS.
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={generateReport}
          disabled={!hasSomething}
          className="text-[9px] tracking-[0.3em] px-4 py-2 transition-all"
          style={{
            border: `1px solid ${hasSomething ? "#00ff41" : "#002200"}`,
            color: hasSomething ? "#00ff41" : "#002200",
          }}
          data-ocid="osint.primary_button"
        >
          ◈ GENERATE CLASSIFIED REPORT
        </button>
        {reportText && (
          <button
            type="button"
            onClick={copyReport}
            className="text-[9px] tracking-[0.3em] px-4 py-2 transition-all"
            style={{ border: "1px solid #00aa2a", color: "#00aa2a" }}
            data-ocid="osint.secondary_button"
          >
            {copied ? "✓ COPIED" : "⎘ COPY REPORT"}
          </button>
        )}
      </div>

      {!hasSomething && (
        <div
          className="p-4 text-[8px] tracking-wider"
          style={{
            border: "1px solid #001500",
            backgroundColor: "#000800",
            color: "#003300",
          }}
          data-ocid="osint.empty_state"
        >
          NO INTELLIGENCE GATHERED YET. RUN TOOLS TO POPULATE REPORT DATA.
          <div className="mt-2 space-y-1" style={{ color: "#001a00" }}>
            {[
              "BREACH INTEL",
              "IP/DOMAIN LOOKUP",
              "ENTITY SEARCH",
              "THREAT FEED",
            ].map((t) => (
              <div key={t}>████ {t}: NO DATA</div>
            ))}
          </div>
        </div>
      )}

      {reportText && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <pre
            className="text-[8px] leading-relaxed p-4 overflow-x-auto whitespace-pre-wrap"
            style={{
              border: "1px solid #003300",
              backgroundColor: "#000800",
              color: "#00ff41",
              fontFamily: "monospace",
            }}
          >
            {reportText}
          </pre>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TOOLS: { id: Tool; label: string; short: string }[] = [
  { id: "breach", label: "BREACH INTEL", short: "B" },
  { id: "ipdomain", label: "IP/DOMAIN", short: "I" },
  { id: "entity", label: "ENTITY INTEL", short: "E" },
  { id: "threats", label: "THREAT FEED", short: "T" },
  { id: "report", label: "REPORT", short: "R" },
];

export default function OsintPortal({ isAdmin }: { isAdmin: boolean }) {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem("osint_splash_done") === "1",
  );
  const [typewriterText, setTypewriterText] = useState("");
  const [blinkVisible, setBlinkVisible] = useState(true);
  const [activeTool, setActiveTool] = useState<Tool>("breach");

  // Shared result state for report aggregation
  const [breachResult, setBreachResult] = useState<BreachResult | null>(null);
  const [ipResult, setIPResult] = useState<IPDomainResult | null>(null);
  const [entityResult, setEntityResult] = useState<EntityResult | null>(null);
  const [threatResult, setThreatResult] = useState<ThreatsResult | null>(null);

  // API status indicators
  const [apiStatus, setApiStatus] = useState({
    hibp: "checking" as "checking" | "online" | "offline",
    ipinfo: "checking" as "checking" | "online" | "offline",
    sfdata: "checking" as "checking" | "online" | "offline",
  });

  const WARNING_TEXT =
    "WARNING: AUTHORIZED PERSONNEL ONLY — UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE UNDER 18 U.S.C. § 1030 — ALL SESSIONS ARE LOGGED AND MONITORED";

  useEffect(() => {
    if (splashDone) return;
    let i = 0;
    const interval = setInterval(() => {
      setTypewriterText(WARNING_TEXT.slice(0, i + 1));
      i++;
      if (i >= WARNING_TEXT.length) clearInterval(interval);
    }, 22);
    return () => clearInterval(interval);
  }, [splashDone]);

  useEffect(() => {
    const interval = setInterval(() => setBlinkVisible((v) => !v), 600);
    return () => clearInterval(interval);
  }, []);

  // Check API availability
  useEffect(() => {
    if (!splashDone) return;
    const checks: Array<{ key: keyof typeof apiStatus; url: string }> = [
      { key: "hibp", url: "https://haveibeenpwned.com/api/v3/breaches" },
      { key: "ipinfo", url: "https://ipinfo.io/8.8.8.8/json" },
      {
        key: "sfdata",
        url: "https://data.sfgov.org/resource/wg3w-h783.json?$limit=1",
      },
    ];
    for (const { key, url } of checks) {
      fetch(url, { signal: AbortSignal.timeout(5000) })
        .then((r) =>
          setApiStatus((s) => ({ ...s, [key]: r.ok ? "online" : "offline" })),
        )
        .catch(() => setApiStatus((s) => ({ ...s, [key]: "offline" })));
    }
  }, [splashDone]);

  const handleEnterTerminal = () => {
    sessionStorage.setItem("osint_splash_done", "1");
    setSplashDone(true);
  };

  // ── Splash Screen ──────────────────────────────────────────────────────────
  if (!splashDone) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor: "#000400",
          fontFamily: "'Courier New', monospace",
        }}
      >
        {/* Scanline overlay */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,20,0,0.15) 2px, rgba(0,20,0,0.15) 4px)",
            zIndex: 10,
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl text-center"
          style={{ position: "relative", zIndex: 20 }}
        >
          <div
            className="text-[8px] tracking-[0.5em] mb-6"
            style={{ color: "#003300" }}
          >
            BLACKGRID SECURITY NETWORK — CLASSIFIED SYSTEM
          </div>

          <div
            className="text-5xl md:text-7xl font-bold tracking-[0.3em] mb-2"
            style={{
              color: "#00ff41",
              textShadow: "0 0 30px #00ff4166, 0 0 60px #00ff4133",
              fontFamily: "'Courier New', monospace",
            }}
          >
            ◈ OSIRIS ◈
          </div>

          <div
            className="text-[8px] md:text-[10px] tracking-[0.2em] mb-8"
            style={{ color: "#00661a" }}
          >
            OPERATIONAL SIGNAL INTELLIGENCE & RECONNAISSANCE INFORMATION SYSTEM
          </div>

          <div className="border mb-8 p-1" style={{ borderColor: "#003300" }}>
            <div
              className="border p-4"
              style={{ borderColor: "#002200", backgroundColor: "#000800" }}
            >
              <div
                className="text-[8px] tracking-widest mb-4"
                style={{ color: "#005500" }}
              >
                ▓▓▓▓▓▓▓▓ FEDERAL WARNING ▓▓▓▓▓▓▓▓
              </div>
              <p
                className="text-[9px] leading-relaxed"
                style={{ color: "#00661a", minHeight: "3rem" }}
              >
                {typewriterText}
                {blinkVisible && <span style={{ color: "#00ff41" }}>▋</span>}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 text-[8px]">
            {[
              { label: "CLEARANCE REQUIRED", value: "ELITE+" },
              { label: "CLASSIFICATION", value: "TOP SECRET" },
              { label: "DATA SOURCES", value: "PUBLIC APIS" },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3"
                style={{
                  border: "1px solid #002200",
                  backgroundColor: "#000800",
                }}
              >
                <div style={{ color: "#003300" }}>{item.label}</div>
                <div
                  className="font-bold mt-1 tracking-widest"
                  style={{ color: "#00ff41" }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <motion.button
            type="button"
            onClick={handleEnterTerminal}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3 text-[10px] tracking-[0.4em] transition-all"
            style={{
              border: "2px solid #00ff41",
              color: "#00ff41",
              backgroundColor: "transparent",
            }}
            data-ocid="osint.primary_button"
          >
            ▶ ENTER OSIRIS TERMINAL
          </motion.button>

          {isAdmin && (
            <div
              className="mt-4 text-[8px] tracking-widest"
              style={{ color: "#008800" }}
            >
              ✦ ADMIN CLEARANCE VERIFIED — FULL ACCESS GRANTED
            </div>
          )}

          <div
            className="mt-6 text-[7px] tracking-widest"
            style={{ color: "#001a00" }}
          >
            ALL INTELLIGENCE SOURCED FROM PUBLIC APIs — WIKIPEDIA, HIBP, IPINFO,
            SF OPENDATA
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main Terminal ──────────────────────────────────────────────────────────
  return (
    <div
      style={{
        backgroundColor: "#000400",
        fontFamily: "'Courier New', monospace",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,20,0,0.1) 2px, rgba(0,20,0,0.1) 4px)",
          zIndex: 1,
        }}
      />

      <div className="relative" style={{ zIndex: 2 }}>
        {/* Header */}
        <div
          className="px-4 md:px-6 pt-6 pb-4"
          style={{ borderBottom: "1px solid #002200" }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div
                className="text-2xl md:text-3xl font-bold tracking-[0.25em]"
                style={{
                  color: "#00ff41",
                  textShadow: "0 0 20px #00ff4144",
                  fontFamily: "'Courier New', monospace",
                }}
              >
                ◈ OSIRIS ◈
              </div>
              <div
                className="text-[7px] tracking-[0.2em] mt-0.5"
                style={{ color: "#00661a" }}
              >
                OPERATIONAL SIGNAL INTELLIGENCE & RECONNAISSANCE INFORMATION
                SYSTEM
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-4">
              <div
                className="text-[7px] tracking-widest px-2 py-1"
                style={{ border: "1px solid #003300", color: "#00aa2a" }}
              >
                CLEARANCE: ELITE+
              </div>
              <div className="flex items-center gap-3">
                {(
                  [
                    { key: "hibp", label: "HIBP" },
                    { key: "ipinfo", label: "IPINFO" },
                    { key: "sfdata", label: "SFDATA" },
                  ] as const
                ).map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-1">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          apiStatus[key] === "online"
                            ? "#00ff41"
                            : apiStatus[key] === "offline"
                              ? "#ff2200"
                              : "#ffcc00",
                        boxShadow:
                          apiStatus[key] === "online"
                            ? "0 0 4px #00ff41"
                            : "none",
                      }}
                    />
                    <span
                      className="text-[7px] tracking-wider"
                      style={{ color: "#003300" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tool Tabs */}
        <div
          className="flex overflow-x-auto px-4 md:px-6"
          style={{ borderBottom: "1px solid #001500" }}
        >
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTool(t.id)}
              className="shrink-0 text-[8px] tracking-[0.3em] px-4 py-3 transition-all"
              style={{
                color: activeTool === t.id ? "#00ff41" : "#003300",
                borderBottom:
                  activeTool === t.id
                    ? "2px solid #00ff41"
                    : "2px solid transparent",
                backgroundColor:
                  activeTool === t.id ? "#001500" : "transparent",
              }}
              data-ocid="osint.tab"
            >
              <span className="hidden md:inline">{t.label}</span>
              <span className="md:hidden">{t.short}</span>
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div className="px-4 md:px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {activeTool === "breach" && (
                <BreachPanelWrapper
                  onResult={setBreachResult}
                  isAdmin={isAdmin}
                />
              )}
              {activeTool === "ipdomain" && (
                <IPDomainPanelWrapper onResult={setIPResult} />
              )}
              {activeTool === "entity" && (
                <EntityPanelWrapper onResult={setEntityResult} />
              )}
              {activeTool === "threats" && (
                <ThreatFeedPanelWrapper onResult={setThreatResult} />
              )}
              {activeTool === "report" && (
                <ReportPanel
                  breachResult={breachResult}
                  ipResult={ipResult}
                  entityResult={entityResult}
                  threatResult={threatResult}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div
          className="text-center py-4 mt-4 text-[7px] tracking-[0.3em]"
          style={{ borderTop: "1px solid #001500", color: "#001a00" }}
        >
          [END OF REPORT] [BLACKGRID OSIRIS DIVISION] [ALL DATA FOR AUTHORIZED
          USE ONLY] [WIKIPEDIA · HIBP · IPINFO · SFDATA · RSSBRIDGE — PUBLIC
          DATA ONLY]
        </div>
      </div>
    </div>
  );
}

function generateASCIIMap(
  city?: string,
  country?: string,
  org?: string,
): string {
  const lines = [
    "┌──────────────────────────────────┐",
    "│  ░░▓▓░ GEOLOCATION TARGET ░▓▓░░  │",
    "│                                  │",
    `│  CITY    : ${(city || "UNKNOWN").padEnd(20)} │`,
    `│  COUNTRY : ${(country || "UNKNOWN").padEnd(20)} │`,
    `│  NET     : ${(org || "UNKNOWN").substring(0, 20).padEnd(20)} │`,
    "│                                  │",
    "│          [◉] TARGET LOCATED      │",
    "└──────────────────────────────────┘",
  ];
  return lines.join("\n");
}

// ─── Wrapper components that capture results for the Report tab ───────────────

function BreachPanelWrapper({
  onResult,
}: {
  onResult: (r: BreachResult) => void;
  isAdmin: boolean;
}) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BreachResult | null>(null);
  const [filter, setFilter] = useState("");

  const run = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const r = await fetchHIBP(query.trim());
    setResult(r);
    onResult(r);
    setLoading(false);
  }, [query, onResult]);

  const displayed = result
    ? (result.matchedBreaches.length > 0
        ? result.matchedBreaches
        : result.allBreaches
      ).filter(
        (b) =>
          !filter ||
          b.Name?.toLowerCase().includes(filter.toLowerCase()) ||
          b.Domain?.toLowerCase().includes(filter.toLowerCase()) ||
          b.DataClasses?.some((d) =>
            d.toLowerCase().includes(filter.toLowerCase()),
          ),
      )
    : [];

  function breachColor(b: HibpBreach): string {
    if (b.DataClasses?.some((d) => /password/i.test(d))) return "#ff2200";
    if (b.DataClasses?.some((d) => /credit|financial|bank/i.test(d)))
      return "#ff8800";
    return "#ffcc00";
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        label="◈ BREACH INTELLIGENCE — HAVEIBEENPWNED DATABASE"
        badge={
          result && (
            <LiveBadge isLive={result.isLive} cacheDate={result.cacheDate} />
          )
        }
      />
      <div
        className="text-[8px] tracking-wider mb-4"
        style={{ color: "#00661a" }}
      >
        ENTER AN EMAIL ADDRESS TO CHECK IF YOUR DOMAIN APPEARS IN KNOWN
        BREACHES, OR ENTER A SERVICE NAME (e.g. "linkedin", "adobe") TO SEARCH
        ALL MATCHING RECORDS. RESULTS ARE SOURCED LIVE FROM THE HAVEIBEENPWNED
        PUBLIC DATABASE.
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="email@domain.com or service name..."
          className="flex-1 bg-transparent text-xs tracking-wider px-3 py-2 outline-none"
          style={{ border: "1px solid #003300", color: "#00ff41" }}
          data-ocid="osint.input"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading || !query.trim()}
          className="text-[9px] tracking-[0.3em] px-4 py-2 transition-all"
          style={{
            border: "1px solid #00ff41",
            color: "#00ff41",
            opacity: !query.trim() ? 0.4 : 1,
          }}
          data-ocid="osint.primary_button"
        >
          SCAN
        </button>
      </div>

      {loading && <TypingLoader label="QUERYING HIBP DATABASE" />}
      {result?.error && <ErrorPanel message={result.error} onRetry={run} />}

      {result && !result.error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div
            className="mb-3 p-3"
            style={{ border: "1px solid #003300", backgroundColor: "#000800" }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <div
                  className="text-[7px] tracking-widest"
                  style={{ color: "#00661a" }}
                >
                  TOTAL BREACHES IN DB
                </div>
                <div className="text-xl" style={{ color: "#00ff41" }}>
                  {result.allBreaches.length.toLocaleString()}
                </div>
              </div>
              <div>
                <div
                  className="text-[7px] tracking-widest"
                  style={{ color: "#00661a" }}
                >
                  MATCHED RECORDS
                </div>
                <div
                  className="text-xl"
                  style={{
                    color:
                      result.matchedBreaches.length > 0 ? "#ff2200" : "#00ff41",
                  }}
                >
                  {result.matchedBreaches.length}
                </div>
              </div>
              <div>
                <div
                  className="text-[7px] tracking-widest"
                  style={{ color: "#00661a" }}
                >
                  QUERY
                </div>
                <div className="text-xs break-all" style={{ color: "#00aa2a" }}>
                  {result.query}
                </div>
              </div>
              <div>
                <div
                  className="text-[7px] tracking-widest"
                  style={{ color: "#00661a" }}
                >
                  STATUS
                </div>
                <div
                  className="text-xs font-bold tracking-wider"
                  style={{
                    color:
                      result.matchedBreaches.length > 0 ? "#ff2200" : "#00ff41",
                  }}
                >
                  {result.matchedBreaches.length > 0
                    ? "⚠ COMPROMISED"
                    : "✓ CLEAN"}
                </div>
              </div>
            </div>
          </div>

          {result.matchedBreaches.length === 0 && (
            <div className="mb-3">
              <div
                className="text-[8px] tracking-wider mb-2"
                style={{ color: "#00661a" }}
              >
                {result.isEmail
                  ? "NO DOMAIN MATCHES — SHOWING FULL DATABASE:"
                  : "SHOWING ALL MATCHING RECORDS — FILTER BY NAME, DOMAIN, OR DATA TYPE:"}
              </div>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="filter results..."
                className="w-full bg-transparent text-xs px-3 py-2 outline-none"
                style={{ border: "1px solid #001500", color: "#00ff41" }}
                data-ocid="osint.search_input"
              />
            </div>
          )}

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {displayed.slice(0, 50).map((b, i) => (
              <div
                key={b.Name}
                className="p-3"
                style={{
                  border: `1px solid ${breachColor(b)}22`,
                  borderLeft: `3px solid ${breachColor(b)}`,
                  backgroundColor: "#000800",
                }}
                data-ocid={`osint.item.${i + 1}` as `osint.item.${number}`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold tracking-wider"
                    style={{ color: breachColor(b) }}
                  >
                    {b.Title || b.Name}
                  </span>
                  {b.Domain && (
                    <span className="text-[8px]" style={{ color: "#00661a" }}>
                      {b.Domain}
                    </span>
                  )}
                  <span
                    className="text-[7px] px-1"
                    style={{ color: "#665500", border: "1px solid #332800" }}
                  >
                    {b.BreachDate}
                  </span>
                  {b.PwnCount && (
                    <span
                      className="text-[7px] px-1"
                      style={{ color: "#884400", border: "1px solid #442200" }}
                    >
                      {b.PwnCount.toLocaleString()} ACCOUNTS
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(b.DataClasses || []).map((dc) => (
                    <span
                      key={dc}
                      className="text-[7px] px-1 py-0.5"
                      style={{
                        color: /password/i.test(dc)
                          ? "#ff2200"
                          : /credit|financial/i.test(dc)
                            ? "#ff8800"
                            : "#00661a",
                        border: `1px solid ${/password/i.test(dc) ? "#330000" : /credit|financial/i.test(dc) ? "#331100" : "#001500"}`,
                      }}
                    >
                      {dc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {displayed.length === 0 && (
              <div
                className="text-[9px] tracking-widest py-4 text-center"
                style={{ color: "#ff2200" }}
              >
                [NO DATA FOUND — SOURCE OFFLINE OR QUERY RETURNED NULL]
              </div>
            )}
          </div>
          <div
            className="mt-3 text-[7px] tracking-wider"
            style={{ color: "#002200" }}
          >
            SOURCE: https://haveibeenpwned.com/api/v3/breaches (PUBLIC API — NO
            KEY REQUIRED — CACHED 24H)
          </div>
        </motion.div>
      )}
    </div>
  );
}

function IPDomainPanelWrapper({
  onResult,
}: { onResult: (r: IPDomainResult) => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IPDomainResult | null>(null);

  const run = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const r = await fetchIPDomain(query.trim());
    setResult(r);
    onResult(r);
    setLoading(false);
  }, [query, onResult]);

  return (
    <div className="space-y-4">
      <SectionHeader
        label="◈ IP & DOMAIN INTELLIGENCE"
        badge={
          result && (
            <LiveBadge isLive={result.isLive} cacheDate={result.cacheDate} />
          )
        }
      />
      <div className="text-[8px] tracking-wider" style={{ color: "#00661a" }}>
        ENTER AN IPv4 ADDRESS (e.g. 8.8.8.8) OR DOMAIN NAME (e.g. google.com) TO
        RETRIEVE GEOLOCATION, ASN, ISP, AND WHOIS REGISTRATION DATA FROM LIVE
        PUBLIC SOURCES.
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="8.8.8.8 or domain.com..."
          className="flex-1 bg-transparent text-xs tracking-wider px-3 py-2 outline-none"
          style={{ border: "1px solid #003300", color: "#00ff41" }}
          data-ocid="osint.input"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading || !query.trim()}
          className="text-[9px] tracking-[0.3em] px-4 py-2 transition-all"
          style={{
            border: "1px solid #00ff41",
            color: "#00ff41",
            opacity: !query.trim() ? 0.4 : 1,
          }}
          data-ocid="osint.primary_button"
        >
          LOOKUP
        </button>
      </div>

      {loading && <TypingLoader label="QUERYING IP INTELLIGENCE" />}
      {result?.error && !result.ipData && !result.whoisData && (
        <ErrorPanel message={result.error} onRetry={run} />
      )}

      {result && (result.ipData || result.whoisData) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {result.ipData && (
            <div>
              <div
                className="text-[8px] tracking-[0.4em] mb-3"
                style={{ color: "#00aa2a" }}
              >
                IP / GEOLOCATION INTELLIGENCE
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DataField
                  label="IP ADDRESS"
                  value={result.ipData.ip || result.query}
                />
                <DataField
                  label="HOSTNAME"
                  value={result.ipData.hostname || "N/A"}
                />
                <DataField label="CITY" value={result.ipData.city || "N/A"} />
                <DataField
                  label="REGION"
                  value={result.ipData.region || "N/A"}
                />
                <DataField
                  label="COUNTRY"
                  value={result.ipData.country || "N/A"}
                />
                <DataField
                  label="ORGANIZATION / ASN"
                  value={result.ipData.org || "N/A"}
                />
                <DataField
                  label="TIMEZONE"
                  value={result.ipData.timezone || "N/A"}
                />
                <DataField
                  label="COORDINATES"
                  value={result.ipData.loc || "N/A"}
                />
              </div>
              <div
                className="mt-3 p-3 font-mono text-[8px] leading-relaxed"
                style={{
                  border: "1px solid #001a00",
                  backgroundColor: "#000800",
                  color: "#00661a",
                }}
              >
                <div style={{ color: "#00ff41" }}>ASCII LOCATION MAP</div>
                <pre className="mt-2 text-[7px]" style={{ color: "#00aa2a" }}>
                  {generateASCIIMap(
                    result.ipData.city,
                    result.ipData.country,
                    result.ipData.org,
                  )}
                </pre>
              </div>
            </div>
          )}

          {result.whoisData && (
            <div>
              <div
                className="text-[8px] tracking-[0.4em] mb-3"
                style={{ color: "#00aa2a" }}
              >
                WHOIS / DOMAIN REGISTRATION
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DataField
                  label="DOMAIN"
                  value={result.whoisData.domain || result.query}
                />
                <DataField
                  label="REGISTRAR"
                  value={result.whoisData.registrar || "N/A"}
                />
                <DataField
                  label="CREATED"
                  value={result.whoisData.creation_date || "N/A"}
                />
                <DataField
                  label="EXPIRES"
                  value={result.whoisData.expiration_date || "N/A"}
                />
                <DataField
                  label="UPDATED"
                  value={result.whoisData.updated_date || "N/A"}
                />
                <DataField
                  label="STATUS"
                  value={
                    Array.isArray(result.whoisData.status)
                      ? result.whoisData.status[0]
                      : result.whoisData.status || "N/A"
                  }
                />
                <DataField
                  label="COUNTRY"
                  value={result.whoisData.country || "N/A"}
                />
                <DataField
                  label="DNSSEC"
                  value={result.whoisData.dnssec || "N/A"}
                />
              </div>
              {result.whoisData.name_servers &&
                result.whoisData.name_servers.length > 0 && (
                  <div
                    className="mt-3 p-3"
                    style={{ border: "1px solid #001500" }}
                  >
                    <div
                      className="text-[7px] tracking-widest mb-2"
                      style={{ color: "#00661a" }}
                    >
                      NAMESERVERS
                    </div>
                    {result.whoisData.name_servers.map((ns) => (
                      <div
                        key={ns}
                        className="text-[9px]"
                        style={{ color: "#00aa2a" }}
                      >
                        {ns}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}

          <div
            className="text-[7px] tracking-wider"
            style={{ color: "#002200" }}
          >
            SOURCES: https://ipinfo.io (GEOLOCATION) | https://api.whoisjson.com
            (WHOIS) — CACHED 24H
          </div>
        </motion.div>
      )}
    </div>
  );
}

function EntityPanelWrapper({
  onResult,
}: { onResult: (r: EntityResult) => void }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EntityResult | null>(null);

  const run = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    const r = await fetchEntity(query.trim());
    setResult(r);
    onResult(r);
    setLoading(false);
  }, [query, onResult]);

  const scoreColor = (s: number) => {
    if (s >= 80) return "#ff2200";
    if (s >= 60) return "#ff8800";
    if (s >= 40) return "#ffcc00";
    return "#00ff41";
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        label="◈ ENTITY INTELLIGENCE — PERSON / ORGANIZATION"
        badge={
          result && (
            <LiveBadge isLive={result.isLive} cacheDate={result.cacheDate} />
          )
        }
      />
      <div className="text-[8px] tracking-wider" style={{ color: "#00661a" }}>
        SEARCH A PERSON OR ORGANIZATION TO AGGREGATE PUBLIC INTELLIGENCE FROM
        WIKIPEDIA AND GOOGLE NEWS. REAL RESULTS ONLY — NO FABRICATED DATA.
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Elon Musk, OpenAI, Microsoft..."
          className="flex-1 bg-transparent text-xs tracking-wider px-3 py-2 outline-none"
          style={{ border: "1px solid #003300", color: "#00ff41" }}
          data-ocid="osint.input"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading || !query.trim()}
          className="text-[9px] tracking-[0.3em] px-4 py-2 transition-all"
          style={{
            border: "1px solid #00ff41",
            color: "#00ff41",
            opacity: !query.trim() ? 0.4 : 1,
          }}
          data-ocid="osint.primary_button"
        >
          ANALYZE
        </button>
      </div>

      {loading && <TypingLoader label="AGGREGATING PUBLIC INTELLIGENCE" />}
      {result?.error && !result.wiki && result.news.length === 0 && (
        <ErrorPanel message={result.error} onRetry={run} />
      )}

      {result && (result.wiki || result.news.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div
            className="p-4"
            style={{
              border: `1px solid ${scoreColor(result.exposureScore)}44`,
              backgroundColor: "#000800",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className="text-[8px] tracking-widest"
                style={{ color: "#00661a" }}
              >
                PUBLIC EXPOSURE SCORE
              </div>
              <div
                className="text-2xl font-bold"
                style={{ color: scoreColor(result.exposureScore) }}
              >
                {result.exposureScore}/100
              </div>
            </div>
            <div className="w-full h-2" style={{ backgroundColor: "#001500" }}>
              <div
                className="h-2 transition-all duration-700"
                style={{
                  width: `${result.exposureScore}%`,
                  backgroundColor: scoreColor(result.exposureScore),
                }}
              />
            </div>
            <div
              className="flex gap-4 mt-2 text-[7px]"
              style={{ color: "#00661a" }}
            >
              <span>WIKIPEDIA: {result.wiki ? "+40" : "+0"}</span>
              <span>
                NEWS HITS ({result.news.length}): +
                {Math.min(result.news.length * 5, 40)}
              </span>
              <span>
                DOMAIN: {result.news.length > 0 || result.wiki ? "+20" : "+0"}
              </span>
            </div>
          </div>

          {result.wiki && (
            <div
              className="p-4"
              style={{
                border: "1px solid #003300",
                borderLeft: "3px solid #00ff41",
                backgroundColor: "#000f00",
              }}
            >
              <div
                className="text-[8px] tracking-widest mb-2"
                style={{ color: "#00aa2a" }}
              >
                WIKIPEDIA PROFILE
              </div>
              {result.wiki.thumbnail && (
                <img
                  src={result.wiki.thumbnail.source}
                  alt={result.wiki.title}
                  className="float-right ml-3 mb-2 w-20 h-20 object-cover"
                  style={{
                    border: "1px solid #003300",
                    filter: "grayscale(30%)",
                  }}
                />
              )}
              <div
                className="text-[10px] font-bold mb-2"
                style={{ color: "#00ff41" }}
              >
                {result.wiki.title}
              </div>
              <div
                className="text-[9px] leading-relaxed"
                style={{ color: "#00aa2a" }}
              >
                {result.wiki.extract}
              </div>
              {result.wiki.content_urls?.desktop.page && (
                <a
                  href={result.wiki.content_urls.desktop.page}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-[7px] tracking-widest"
                  style={{
                    color: "#00661a",
                    borderBottom: "1px solid #003300",
                  }}
                >
                  ↗ VIEW PUBLIC RECORD ON WIKIPEDIA
                </a>
              )}
            </div>
          )}

          {result.news.length > 0 && (
            <div>
              <div
                className="text-[8px] tracking-widest mb-3"
                style={{ color: "#00aa2a" }}
              >
                RECENT NEWS COVERAGE ({result.news.length} ARTICLES)
              </div>
              <div className="space-y-2">
                {result.news.map((item, i) => (
                  <div
                    key={item.title}
                    className="p-3"
                    style={{
                      border: "1px solid #001500",
                      backgroundColor: "#000800",
                    }}
                    data-ocid={`osint.item.${i + 1}` as `osint.item.${number}`}
                  >
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] leading-tight block mb-1 hover:underline"
                      style={{ color: "#00ff41" }}
                    >
                      {item.title}
                    </a>
                    <div
                      className="flex gap-3 text-[7px]"
                      style={{ color: "#003300" }}
                    >
                      {item.author && <span>{item.author}</span>}
                      <span>{new Date(item.pubDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className="text-[7px] tracking-wider"
            style={{ color: "#002200" }}
          >
            SOURCES: https://en.wikipedia.org/api/rest_v1 |
            https://api.rss2json.com (Google News RSS) — CACHED 24H
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ThreatFeedPanelWrapper({
  onResult,
}: { onResult: (r: ThreatsResult) => void }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThreatsResult | null>(null);
  const [tab, setTab] = useState<"cyber" | "sf">("cyber");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetchThreats();
    setResult(r);
    onResult(r);
    setLoading(false);
  }, [onResult]);

  useEffect(() => {
    load();
  }, [load]);

  const items = result
    ? tab === "cyber"
      ? result.cyberThreats
      : result.sfIncidents
    : [];

  return (
    <div className="space-y-4">
      <SectionHeader
        label="◈ LIVE THREAT INTELLIGENCE FEED"
        badge={
          result && (
            <LiveBadge isLive={result.isLive} cacheDate={result.cacheDate} />
          )
        }
      />

      <div className="flex gap-2">
        {(["cyber", "sf"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="text-[8px] tracking-[0.3em] px-3 py-1.5 transition-all"
            style={{
              border: `1px solid ${tab === t ? "#00ff41" : "#002200"}`,
              color: tab === t ? "#00ff41" : "#003300",
              backgroundColor: tab === t ? "#001500" : "transparent",
            }}
            data-ocid="osint.tab"
          >
            {t === "cyber" ? "CYBER THREATS" : "SF INCIDENTS"}
          </button>
        ))}
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="ml-auto text-[8px] tracking-widest px-3 py-1.5 transition-all"
          style={{ border: "1px solid #003300", color: "#00661a" }}
          data-ocid="osint.secondary_button"
        >
          ↻ REFRESH
        </button>
      </div>

      {loading && <TypingLoader label="PULLING LIVE THREAT FEED" />}
      {result?.error && items.length === 0 && (
        <ErrorPanel message={result.error} onRetry={load} />
      )}

      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          {items.map((item, i) => (
            <div
              key={item.title}
              className="p-3"
              style={{
                border: `1px solid ${SEVERITY_COLORS[item.severity]}22`,
                borderLeft: `3px solid ${SEVERITY_COLORS[item.severity]}`,
                backgroundColor: "#000800",
              }}
              data-ocid={`osint.item.${i + 1}` as `osint.item.${number}`}
            >
              <div className="flex items-start gap-2">
                <span
                  className="text-[7px] tracking-widest px-1.5 py-0.5 mt-0.5 shrink-0"
                  style={{
                    color: SEVERITY_COLORS[item.severity],
                    border: `1px solid ${SEVERITY_COLORS[item.severity]}44`,
                  }}
                >
                  {item.severity}
                </span>
                <div className="flex-1">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] leading-tight block mb-1 hover:underline"
                    style={{ color: "#00ff41" }}
                  >
                    {item.title}
                  </a>
                  {item.description && (
                    <div
                      className="text-[8px] mb-1"
                      style={{ color: "#00661a" }}
                    >
                      {item.description
                        .replace(/<[^>]*>/g, "")
                        .substring(0, 120)}
                      ...
                    </div>
                  )}
                  <div
                    className="flex gap-3 text-[7px]"
                    style={{ color: "#002200" }}
                  >
                    <span>{item.source}</span>
                    <span>{new Date(item.pubDate).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {!loading && items.length === 0 && !result?.error && (
        <div
          className="text-[9px] tracking-widest py-4 text-center"
          style={{ color: "#ff2200" }}
        >
          [NO DATA FOUND — SOURCE OFFLINE OR QUERY RETURNED NULL]
        </div>
      )}

      {result && (
        <div className="text-[7px] tracking-wider" style={{ color: "#002200" }}>
          SOURCES: https://data.sfgov.org (SF OPENDATA) |
          https://feeds.feedburner.com/TheHackersNews — AUTO-REFRESHES EVERY 1H
        </div>
      )}
    </div>
  );
}
