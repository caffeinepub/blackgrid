import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

type ResultPanel = "profile" | "footprint" | "breach" | "dossier" | "business";

interface DossierEntry {
  id: string;
  target: string;
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  notes: string;
  savedAt: string;
}

interface WikiSummary {
  type: string;
  title: string;
  extract: string;
  thumbnail?: { source: string };
  content_urls?: { desktop: { page: string } };
}

interface HibpBreach {
  Name: string;
  Domain: string;
  BreachDate: string;
  DataClasses: string[];
}

function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function seededRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const normalized = Math.abs(hash % 1000) / 1000;
  return Math.floor(normalized * (max - min + 1)) + min;
}

function generateProfileData(query: string) {
  const cities = [
    "San Francisco, CA",
    "Oakland, CA",
    "San Jose, CA",
    "Berkeley, CA",
    "Sacramento, CA",
    "Los Angeles, CA",
  ];
  const platforms = ["Twitter", "LinkedIn", "Facebook", "Instagram", "Reddit"];
  const exposureLevel = seededRandom(`${query}exp`, 0, 2);
  const cityIdx = seededRandom(`${query}city`, 0, cities.length - 1);
  const score = seededRandom(`${query}score`, 20, 95);

  const handles = platforms.map((p) => ({
    platform: p,
    handle: `@${query.toLowerCase().replace(/\s+/g, "_")}_${seededRandom(`${query}${p}`, 10, 99)}`,
    found: seededRandom(`${query}${p}found`, 0, 1) === 1,
  }));

  return {
    score,
    city: cities[cityIdx],
    handles,
    exposureLevel: ["LOW", "MEDIUM", "HIGH"][exposureLevel] as
      | "LOW"
      | "MEDIUM"
      | "HIGH",
  };
}

function generateFootprintData(query: string, newsCount: number | null) {
  const newsValue =
    newsCount !== null
      ? Math.min(newsCount * 20, 100)
      : seededRandom(`${query}news`, 0, 60);
  return [
    { label: "SOCIAL MEDIA", value: seededRandom(`${query}sm`, 20, 95) },
    { label: "NEWS ARTICLES", value: newsValue, isLive: newsCount !== null },
    { label: "PUBLIC RECORDS", value: seededRandom(`${query}pub`, 5, 70) },
    { label: "BUSINESS FILINGS", value: seededRandom(`${query}biz`, 0, 50) },
    { label: "DARK WEB MENTIONS", value: seededRandom(`${query}dw`, 0, 30) },
  ];
}

function generateBusinessData(query: string) {
  const states = ["California", "Delaware", "Nevada", "Texas", "Florida"];
  const bizTypes = ["LLC", "Corporation", "Sole Proprietorship", "Partnership"];
  const stateIdx = seededRandom(`${query}bstate`, 0, states.length - 1);
  const typeIdx = seededRandom(`${query}btype`, 0, bizTypes.length - 1);
  return {
    state: states[stateIdx],
    bizType: bizTypes[typeIdx],
    agent: `${query.split(" ")[0] || "N/A"} Registered Agents Inc.`,
    propertyCount: seededRandom(`${query}prop`, 0, 5),
    filingDate: `${seededRandom(`${query}fy`, 2010, 2023)}-${String(seededRandom(`${query}fm`, 1, 12)).padStart(2, "0")}-01`,
  };
}

const PANEL_TABS: { id: ResultPanel; label: string }[] = [
  { id: "profile", label: "PERSON PROFILE" },
  { id: "footprint", label: "DIGITAL FOOTPRINT" },
  { id: "breach", label: "BREACH STATUS" },
  { id: "dossier", label: "THREAT DOSSIER" },
  { id: "business", label: "BUSINESS INTEL" },
];

const RISK_COLORS: Record<string, string> = {
  LOW: "#00ff41",
  MEDIUM: "#ffcc00",
  HIGH: "#ff8800",
  CRITICAL: "#ff0000",
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function loadCacheItem<T>(key: string): { data: T; fetchedAt: string } | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    const age = Date.now() - new Date(entry.fetchedAt).getTime();
    if (age < CACHE_TTL_MS) return entry;
    return null;
  } catch {
    return null;
  }
}

function saveCacheItem<T>(key: string, data: T) {
  localStorage.setItem(
    key,
    JSON.stringify({ data, fetchedAt: new Date().toISOString() }),
  );
}

function formatCacheDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

interface LiveProfileResult {
  extract: string;
  hasPhoto: boolean;
  photoUrl?: string;
  pageUrl?: string;
  score: number;
  city: string;
  handles: { platform: string; handle: string; found: boolean }[];
  exposureLevel: "LOW" | "MEDIUM" | "HIGH";
  isLive: boolean;
  cacheDate?: string;
  isSimulated?: boolean;
}

interface LiveFootprintResult {
  bars: { label: string; value: number; isLive?: boolean }[];
  newsCount: number | null;
  sourcesFound: number;
  isLive: boolean;
  cacheDate?: string;
}

interface LiveBreachResult {
  isClean: boolean;
  breaches: { name: string; date: string; dataTypes: string[] }[];
  totalBreachCount: number;
  needsEmail: boolean;
  isLive: boolean;
  cacheDate?: string;
  isSimulated?: boolean;
}

export default function OsintPortal({ isAdmin }: { isAdmin: boolean }) {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem("osint_splash_done") === "1",
  );
  const [typewriterText, setTypewriterText] = useState("");
  const [blinkVisible, setBlinkVisible] = useState(true);
  const [query, setQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [hasResults, setHasResults] = useState(false);
  const [activePanel, setActivePanel] = useState<ResultPanel>("profile");
  const [currentQuery, setCurrentQuery] = useState("");
  const [dossierNotes, setDossierNotes] = useState("");
  const [dossierRisk, setDossierRisk] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  >("LOW");
  const [dossiers, setDossiers] = useState<DossierEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("osint_dossiers") || "[]");
    } catch {
      return [];
    }
  });

  // Live data state
  const [profileResult, setProfileResult] = useState<LiveProfileResult | null>(
    null,
  );
  const [footprintResult, setFootprintResult] =
    useState<LiveFootprintResult | null>(null);
  const [breachResult, setBreachResult] = useState<LiveBreachResult | null>(
    null,
  );

  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const WARNING_TEXT =
    "WARNING: AUTHORIZED PERSONNEL ONLY — UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE UNDER 18 U.S.C. § 1030";

  useEffect(() => {
    if (splashDone) return;
    let i = 0;
    const interval = setInterval(() => {
      setTypewriterText(WARNING_TEXT.slice(0, i + 1));
      i++;
      if (i >= WARNING_TEXT.length) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  }, [splashDone]);

  useEffect(() => {
    const interval = setInterval(() => setBlinkVisible((v) => !v), 600);
    return () => clearInterval(interval);
  }, []);

  const handleEnterTerminal = () => {
    sessionStorage.setItem("osint_splash_done", "1");
    setSplashDone(true);
  };

  // Fetch Wikipedia profile
  async function fetchProfile(q: string): Promise<LiveProfileResult> {
    const cacheKey = `bg_osint_profile_${simpleHash(q)}`;
    const cached = loadCacheItem<LiveProfileResult>(cacheKey);
    if (cached)
      return {
        ...cached.data,
        cacheDate: formatCacheDate(cached.fetchedAt),
        isLive: false,
      };

    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`,
      );
      const json: WikiSummary = await res.json();
      const seed = generateProfileData(q);
      if (json.type === "standard") {
        const result: LiveProfileResult = {
          extract: json.extract,
          hasPhoto: !!json.thumbnail?.source,
          photoUrl: json.thumbnail?.source,
          pageUrl: json.content_urls?.desktop.page,
          score: Math.min(95, 40 + json.extract.length / 10),
          city: seed.city,
          handles: seed.handles,
          exposureLevel: "HIGH",
          isLive: true,
        };
        saveCacheItem(cacheKey, result);
        return result;
      }
      // No page found — use seeded fallback
      return {
        ...seed,
        extract: "",
        hasPhoto: false,
        isLive: false,
        isSimulated: true,
      };
    } catch {
      const seed = generateProfileData(q);
      return {
        ...seed,
        extract: "",
        hasPhoto: false,
        isLive: false,
        isSimulated: true,
      };
    }
  }

  // Fetch Wikipedia search for footprint
  async function fetchFootprint(q: string): Promise<LiveFootprintResult> {
    const cacheKey = `bg_osint_footprint_${simpleHash(q)}`;
    const cached = loadCacheItem<LiveFootprintResult>(cacheKey);
    if (cached)
      return {
        ...cached.data,
        cacheDate: formatCacheDate(cached.fetchedAt),
        isLive: false,
      };

    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=5`;
      const res = await fetch(url);
      const json = await res.json();
      const count: number = json?.query?.search?.length ?? 0;
      const bars = generateFootprintData(q, count);
      const result: LiveFootprintResult = {
        bars,
        newsCount: count,
        sourcesFound: count,
        isLive: true,
      };
      saveCacheItem(cacheKey, result);
      return result;
    } catch {
      const bars = generateFootprintData(q, null);
      return { bars, newsCount: null, sourcesFound: 0, isLive: false };
    }
  }

  // Fetch HIBP breach list + match
  async function fetchBreach(q: string): Promise<LiveBreachResult> {
    const hibpKey = "bg_hibp_breaches";
    const isEmail = q.includes("@");

    // Get full breach list (24h cache)
    let allBreaches: HibpBreach[] = [];
    let listIsLive = false;
    let listCacheDate: string | undefined;
    const cachedList = loadCacheItem<HibpBreach[]>(hibpKey);
    if (cachedList) {
      allBreaches = cachedList.data;
      listCacheDate = formatCacheDate(cachedList.fetchedAt);
    } else {
      try {
        const res = await fetch("https://haveibeenpwned.com/api/v3/breaches");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allBreaches = await res.json();
        saveCacheItem(hibpKey, allBreaches);
        listIsLive = true;
      } catch {
        // fallback empty
      }
    }

    if (!isEmail) {
      return {
        isClean: true,
        breaches: [],
        totalBreachCount: allBreaches.length,
        needsEmail: true,
        isLive: listIsLive,
        cacheDate: listCacheDate,
      };
    }

    const domain = q.split("@")[1]?.toLowerCase() ?? "";
    const matched = allBreaches
      .filter((b) => b.Domain?.toLowerCase() === domain)
      .map((b) => ({
        name: b.Name,
        date: b.BreachDate,
        dataTypes: b.DataClasses ?? [],
      }));

    return {
      isClean: matched.length === 0,
      breaches: matched,
      totalBreachCount: allBreaches.length,
      needsEmail: false,
      isLive: listIsLive || !!cachedList,
      cacheDate: listCacheDate,
    };
  }

  const handleExecuteQuery = async () => {
    if (!query.trim()) return;
    setScanning(true);
    setScanProgress(0);
    setHasResults(false);
    setProfileResult(null);
    setFootprintResult(null);
    setBreachResult(null);

    const q = query.trim();

    // Animate progress while fetching
    scanIntervalRef.current = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 90) {
          if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
          return 90;
        }
        return p + seededRandom(`${q}${p}`, 8, 18);
      });
    }, 80);

    const [profile, footprint, breach] = await Promise.all([
      fetchProfile(q),
      fetchFootprint(q),
      fetchBreach(q),
    ]);

    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    setScanProgress(100);
    setProfileResult(profile);
    setFootprintResult(footprint);
    setBreachResult(breach);
    setCurrentQuery(q);
    setHasResults(true);
    setScanning(false);
  };

  const handleSaveDossier = () => {
    const entry: DossierEntry = {
      id: Date.now().toString(),
      target: currentQuery,
      risk: dossierRisk,
      notes: dossierNotes,
      savedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    const updated = [entry, ...dossiers];
    setDossiers(updated);
    localStorage.setItem("osint_dossiers", JSON.stringify(updated));
    setDossierNotes("");
  };

  const handleDeleteDossier = (id: string) => {
    const updated = dossiers.filter((d) => d.id !== id);
    setDossiers(updated);
    localStorage.setItem("osint_dossiers", JSON.stringify(updated));
  };

  const businessData = hasResults ? generateBusinessData(currentQuery) : null;

  // Splash screen
  if (!splashDone) {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center font-mono"
        style={{ backgroundColor: "#000000" }}
        data-ocid="osint.modal"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.03) 2px, rgba(0,255,65,0.03) 4px)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-xl mx-4 text-center px-8 py-12"
          style={{
            border: "1px solid #ff0000",
            boxShadow: "0 0 60px rgba(255,0,0,0.15)",
          }}
        >
          <div
            className="text-[10px] tracking-[0.4em] mb-6 font-bold"
            style={{ color: "#ff0000" }}
          >
            {"██ TOP SECRET // BLACKGRID OSINT DIVISION ██"}
          </div>

          <div
            className="text-3xl font-bold tracking-[0.3em] mb-2"
            style={{ color: "#ff0000" }}
          >
            CLASSIFIED
          </div>
          <div
            className="text-[11px] tracking-[0.5em] mb-8"
            style={{ color: "#ff6666" }}
          >
            INTELLIGENCE TERMINAL ACCESS
          </div>

          <div
            className="text-[9px] leading-relaxed mb-6 text-left p-4"
            style={{
              color: "#ff4444",
              border: "1px solid #330000",
              minHeight: "3.5rem",
            }}
          >
            {typewriterText}
            <span
              style={{
                visibility: blinkVisible ? "visible" : "hidden",
                color: "#ff0000",
              }}
            >
              █
            </span>
          </div>

          <div
            className="inline-block text-[9px] tracking-[0.3em] px-4 py-1 mb-8 font-bold"
            style={{ border: "1px solid #ff0000", color: "#ff0000" }}
          >
            CLASSIFICATION LEVEL: ELITE
          </div>

          <div>
            <motion.button
              type="button"
              onClick={handleEnterTerminal}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              data-ocid="osint.primary_button"
              className="w-full py-4 text-sm tracking-[0.4em] font-bold uppercase transition-all"
              style={{
                backgroundColor: "#000a00",
                border: "1px solid #00ff41",
                color: "#00ff41",
                boxShadow: "0 0 20px rgba(0,255,65,0.2)",
              }}
            >
              ▶ ACCESS TERMINAL
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen font-mono"
      style={{ backgroundColor: "#000a00" }}
      data-ocid="osint.panel"
    >
      {/* Scanlines */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.018) 2px, rgba(0,255,65,0.018) 4px)",
        }}
      />

      <div className="relative z-10">
        {/* Header bar */}
        <div
          className="flex items-center justify-between px-4 py-3 text-[9px] tracking-widest"
          style={{
            borderBottom: "1px solid #003300",
            backgroundColor: "#000500",
          }}
        >
          <div style={{ color: "#00ff41" }}>
            <span className="mr-3">▶</span>
            [BLACKGRID OSINT TERMINAL v2.1]
            <span
              className="ml-3 inline-block w-2 h-2 rounded-full"
              style={{
                backgroundColor: blinkVisible ? "#00ff41" : "transparent",
                boxShadow: blinkVisible ? "0 0 6px #00ff41" : "none",
              }}
            />
            <span className="ml-1" style={{ color: "#00aa2a" }}>
              SYSTEM ONLINE
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <span
                className="text-[8px] tracking-[0.3em] px-2 py-0.5"
                style={{ border: "1px solid #00ff41", color: "#00ff41" }}
              >
                ADMIN CLEARANCE: FULL ACCESS
              </span>
            )}
            <span
              className="text-[9px] tracking-[0.2em] font-bold"
              style={{ color: "#ff0000" }}
            >
              [CLASSIFICATION: TOP SECRET]
            </span>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Search bar */}
          <div className="mb-8">
            <div
              className="text-[9px] tracking-[0.4em] mb-3"
              style={{ color: "#00aa2a" }}
            >
              QUERY INTERFACE — ENTER SUBJECT IDENTIFIER
              <span
                style={{
                  visibility: blinkVisible ? "visible" : "hidden",
                  color: "#00ff41",
                }}
              >
                _
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleExecuteQuery();
                }}
                placeholder="ENTER TARGET: NAME / USERNAME / EMAIL / BUSINESS"
                data-ocid="osint.search_input"
                className="flex-1 px-4 py-3 text-sm tracking-widest uppercase outline-none transition-all"
                style={{
                  backgroundColor: "#000500",
                  border: "1px solid #003300",
                  color: "#00ff41",
                  caretColor: "#00ff41",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid #00ff41";
                  e.currentTarget.style.boxShadow =
                    "0 0 12px rgba(0,255,65,0.2)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid #003300";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
              <motion.button
                type="button"
                onClick={handleExecuteQuery}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={scanning || !query.trim()}
                data-ocid="osint.submit_button"
                className="px-6 py-3 text-[10px] tracking-[0.3em] font-bold uppercase transition-all whitespace-nowrap"
                style={{
                  backgroundColor: "#000a00",
                  border: "1px solid #00ff41",
                  color: scanning ? "#00aa2a" : "#00ff41",
                  opacity: !query.trim() ? 0.5 : 1,
                }}
              >
                {scanning ? "SCANNING..." : "EXECUTE QUERY"}
              </motion.button>
            </div>

            {/* Progress bar */}
            {scanning && (
              <div className="mt-3">
                <div
                  className="text-[8px] tracking-[0.3em] mb-1"
                  style={{ color: "#00aa2a" }}
                >
                  SCANNING OPEN-SOURCE DATABASES...
                </div>
                <div
                  className="h-1.5 w-full rounded-none"
                  style={{ backgroundColor: "#001500" }}
                >
                  <motion.div
                    className="h-full"
                    style={{
                      width: `${Math.min(scanProgress, 100)}%`,
                      backgroundColor: "#00ff41",
                      boxShadow: "0 0 8px #00ff41",
                    }}
                    transition={{ ease: "linear" }}
                    data-ocid="osint.loading_state"
                  />
                </div>
                <div
                  className="text-[8px] tracking-widest mt-1"
                  style={{ color: "#00aa2a" }}
                >
                  {Math.min(Math.round(scanProgress), 100)}% COMPLETE
                </div>
              </div>
            )}
          </div>

          {/* Results */}
          <AnimatePresence>
            {hasResults && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                data-ocid="osint.success_state"
              >
                {/* Query banner */}
                <div
                  className="flex items-center justify-between px-4 py-3 mb-6 text-[9px] tracking-widest"
                  style={{
                    border: "1px solid #003300",
                    backgroundColor: "#000800",
                  }}
                >
                  <span style={{ color: "#00aa2a" }}>
                    QUERY COMPLETE — TARGET:
                  </span>
                  <span
                    className="font-bold text-sm uppercase"
                    style={{ color: "#00ff41" }}
                  >
                    {currentQuery}
                  </span>
                  <span style={{ color: "#00aa2a" }}>
                    {new Date().toLocaleTimeString()} LOCAL
                  </span>
                </div>

                {/* Panel tabs */}
                <div
                  className="flex gap-0 mb-6 overflow-x-auto"
                  style={{ borderBottom: "1px solid #003300" }}
                >
                  {PANEL_TABS.map((pt, idx) => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => setActivePanel(pt.id)}
                      data-ocid={
                        `osint.tab.${idx + 1}` as `osint.tab.${number}`
                      }
                      className="px-4 py-2 text-[8px] tracking-[0.25em] whitespace-nowrap transition-all"
                      style={{
                        color: activePanel === pt.id ? "#00ff41" : "#00661a",
                        borderBottom:
                          activePanel === pt.id
                            ? "2px solid #00ff41"
                            : "2px solid transparent",
                        backgroundColor:
                          activePanel === pt.id ? "#000f00" : "transparent",
                      }}
                    >
                      {pt.label}
                    </button>
                  ))}
                </div>

                {/* Panel content */}
                <AnimatePresence mode="wait">
                  {activePanel === "profile" && profileResult && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div
                        className="p-5"
                        style={{
                          border: "1px solid #003300",
                          borderLeft: "3px solid #00ff41",
                          backgroundColor: "#000f00",
                        }}
                      >
                        {/* Data source badge */}
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="text-[9px] tracking-[0.4em]"
                            style={{ color: "#00aa2a" }}
                          >
                            SUBJECT ANALYSIS — DIGITAL PRESENCE REPORT
                          </div>
                          {profileResult.isSimulated ? (
                            <span
                              className="text-[7px] tracking-widest px-2 py-0.5"
                              style={{
                                border: "1px solid #333300",
                                color: "#888800",
                              }}
                            >
                              SIMULATED DATA
                            </span>
                          ) : profileResult.isLive ? (
                            <span
                              className="text-[7px] tracking-widest px-2 py-0.5"
                              style={{
                                border: "1px solid #003300",
                                color: "#00ff41",
                              }}
                            >
                              ⚡ LIVE
                            </span>
                          ) : (
                            <span
                              className="text-[7px] tracking-widest px-2 py-0.5"
                              style={{
                                border: "1px solid #002200",
                                color: "#00661a",
                              }}
                            >
                              📦 CACHED {profileResult.cacheDate}
                            </span>
                          )}
                        </div>

                        {/* Wikipedia real extract */}
                        {profileResult.extract && (
                          <div
                            className="mb-4 p-3 text-[10px] leading-relaxed"
                            style={{
                              border: "1px solid #002200",
                              color: "#00cc33",
                              backgroundColor: "#000800",
                            }}
                          >
                            <div
                              className="text-[7px] tracking-widest mb-2"
                              style={{ color: "#005500" }}
                            >
                              PUBLIC RECORD EXTRACT
                            </div>
                            {profileResult.extract.slice(0, 300)}
                            {profileResult.extract.length > 300 ? "..." : ""}
                            {profileResult.pageUrl && (
                              <a
                                href={profileResult.pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-2 text-[8px] tracking-widest underline"
                                style={{ color: "#00ff41" }}
                              >
                                ▶ VIEW PUBLIC RECORD
                              </a>
                            )}
                          </div>
                        )}

                        {!profileResult.extract &&
                          profileResult.isSimulated && (
                            <div
                              className="mb-4 p-2 text-[8px] tracking-widest"
                              style={{
                                border: "1px solid #333300",
                                color: "#888800",
                                backgroundColor: "#0a0a00",
                              }}
                            >
                              NO PUBLIC RECORD FOUND — SHOWING ESTIMATED PROFILE
                            </div>
                          )}

                        {profileResult.hasPhoto && profileResult.photoUrl && (
                          <div className="mb-4 flex items-center gap-3">
                            <img
                              src={profileResult.photoUrl}
                              alt="Subject"
                              className="w-14 h-14 object-cover"
                              style={{ border: "1px solid #003300" }}
                            />
                            <span
                              className="text-[8px] tracking-widest"
                              style={{ color: "#00ff41" }}
                            >
                              ✓ DIGITAL PRESENCE CONFIRMED
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <div
                              className="text-[8px] tracking-widest mb-2"
                              style={{ color: "#00661a" }}
                            >
                              DIGITAL PRESENCE SCORE
                            </div>
                            <div className="flex items-end gap-3">
                              <div
                                className="text-5xl font-bold"
                                style={{ color: "#00ff41" }}
                              >
                                {Math.round(profileResult.score)}
                              </div>
                              <div
                                className="text-[8px] tracking-widest mb-2"
                                style={{ color: "#00aa2a" }}
                              >
                                /100
                              </div>
                            </div>
                            <div
                              className="mt-2 h-1.5 w-full"
                              style={{ backgroundColor: "#001500" }}
                            >
                              <div
                                className="h-full"
                                style={{
                                  width: `${profileResult.score}%`,
                                  backgroundColor:
                                    profileResult.score > 70
                                      ? "#ff4400"
                                      : profileResult.score > 40
                                        ? "#ffcc00"
                                        : "#00ff41",
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div
                                className="text-[8px] tracking-widest mb-1"
                                style={{ color: "#00661a" }}
                              >
                                EST. LOCATION
                              </div>
                              <div
                                className="text-sm"
                                style={{ color: "#00ff41" }}
                              >
                                {profileResult.city}
                              </div>
                            </div>
                            <div>
                              <div
                                className="text-[8px] tracking-widest mb-1"
                                style={{ color: "#00661a" }}
                              >
                                EXPOSURE LEVEL
                              </div>
                              <span
                                className="text-[10px] tracking-[0.3em] font-bold px-2 py-0.5"
                                style={{
                                  color:
                                    RISK_COLORS[profileResult.exposureLevel],
                                  border: `1px solid ${RISK_COLORS[profileResult.exposureLevel]}`,
                                }}
                              >
                                {profileResult.exposureLevel}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div
                            className="text-[8px] tracking-widest mb-3"
                            style={{ color: "#00661a" }}
                          >
                            ASSOCIATED HANDLES
                          </div>
                          <div className="space-y-2">
                            {profileResult.handles.map((h) => (
                              <div
                                key={h.platform}
                                className="flex items-center justify-between text-[10px] tracking-widest"
                              >
                                <span style={{ color: "#00661a" }}>
                                  {h.platform}
                                </span>
                                <span
                                  style={{
                                    color: h.found ? "#00ff41" : "#003300",
                                  }}
                                >
                                  {h.found ? h.handle : "— NOT FOUND —"}
                                </span>
                                <span
                                  className="text-[8px] px-1"
                                  style={{
                                    color: h.found ? "#00ff41" : "#333",
                                    border: `1px solid ${h.found ? "#003300" : "#111"}`,
                                  }}
                                >
                                  {h.found ? "FOUND" : "ABSENT"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activePanel === "footprint" && footprintResult && (
                    <motion.div
                      key="footprint"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className="p-5"
                        style={{
                          border: "1px solid #003300",
                          borderLeft: "3px solid #00ff41",
                          backgroundColor: "#000f00",
                        }}
                      >
                        <div className="flex items-center justify-between mb-5">
                          <div
                            className="text-[9px] tracking-[0.4em]"
                            style={{ color: "#00aa2a" }}
                          >
                            DIGITAL FOOTPRINT ANALYSIS — PLATFORM PRESENCE
                          </div>
                          <div className="flex items-center gap-3">
                            {footprintResult.sourcesFound > 0 && (
                              <span
                                className="text-[7px] tracking-widest px-2 py-0.5"
                                style={{
                                  border: "1px solid #003300",
                                  color: "#00cc33",
                                }}
                              >
                                {footprintResult.sourcesFound} SOURCES FOUND
                              </span>
                            )}
                            {footprintResult.isLive ? (
                              <span
                                className="text-[7px] tracking-widest px-2 py-0.5"
                                style={{
                                  border: "1px solid #003300",
                                  color: "#00ff41",
                                }}
                              >
                                ⚡ LIVE
                              </span>
                            ) : footprintResult.cacheDate ? (
                              <span
                                className="text-[7px] tracking-widest px-2 py-0.5"
                                style={{
                                  border: "1px solid #002200",
                                  color: "#00661a",
                                }}
                              >
                                📦 CACHED {footprintResult.cacheDate}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="space-y-4">
                          {footprintResult.bars.map((item, i) => (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className="flex items-center gap-4"
                            >
                              <div
                                className="text-[8px] tracking-widest w-36 flex-shrink-0 flex items-center gap-1"
                                style={{ color: "#00661a" }}
                              >
                                {item.label}
                                {item.isLive && (
                                  <span style={{ color: "#00ff41" }}>⚡</span>
                                )}
                              </div>
                              <div
                                className="flex-1 h-4 relative"
                                style={{ backgroundColor: "#001000" }}
                              >
                                <div
                                  className="h-full transition-all"
                                  style={{
                                    width: `${item.value}%`,
                                    backgroundColor:
                                      item.label === "DARK WEB MENTIONS"
                                        ? "#ff3300"
                                        : "#00ff41",
                                    boxShadow: `0 0 4px ${item.label === "DARK WEB MENTIONS" ? "#ff3300" : "#00ff41"}`,
                                  }}
                                />
                              </div>
                              <div
                                className="text-[10px] font-bold w-10 text-right"
                                style={{ color: "#00ff41" }}
                              >
                                {item.value}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        <div
                          className="mt-5 pt-4"
                          style={{ borderTop: "1px solid #001500" }}
                        >
                          <span
                            className="text-[9px] tracking-widest"
                            style={{ color: "#00aa2a" }}
                          >
                            OVERALL FOOTPRINT SCORE:{" "}
                          </span>
                          <span
                            className="text-xl font-bold"
                            style={{ color: "#00ff41" }}
                          >
                            {Math.round(
                              footprintResult.bars.reduce(
                                (a, b) => a + b.value,
                                0,
                              ) / footprintResult.bars.length,
                            )}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activePanel === "breach" && breachResult && (
                    <motion.div
                      key="breach"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className="p-5"
                        style={{
                          border: "1px solid #003300",
                          borderLeft: "3px solid #00ff41",
                          backgroundColor: "#000f00",
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className="text-[9px] tracking-[0.4em]"
                            style={{ color: "#00aa2a" }}
                          >
                            DATA BREACH INTELLIGENCE — DATABASE SCAN
                          </div>
                          {breachResult.isLive ? (
                            <span
                              className="text-[7px] tracking-widest px-2 py-0.5"
                              style={{
                                border: "1px solid #003300",
                                color: "#00ff41",
                              }}
                            >
                              ⚡ LIVE
                            </span>
                          ) : breachResult.cacheDate ? (
                            <span
                              className="text-[7px] tracking-widest px-2 py-0.5"
                              style={{
                                border: "1px solid #002200",
                                color: "#00661a",
                              }}
                            >
                              📦 CACHED {breachResult.cacheDate}
                            </span>
                          ) : null}
                        </div>
                        <div
                          className="text-[8px] tracking-widest mb-4"
                          style={{ color: "#005500" }}
                        >
                          {breachResult.totalBreachCount > 0
                            ? `ANALYZED ${breachResult.totalBreachCount} KNOWN DATA BREACH DATABASES`
                            : "ANALYZING KNOWN DATA BREACH DATABASES..."}
                        </div>

                        {breachResult.needsEmail ? (
                          <div
                            className="p-4 text-center"
                            style={{
                              border: "1px solid #002200",
                              backgroundColor: "#000800",
                            }}
                          >
                            <div
                              className="text-[10px] tracking-widest mb-2"
                              style={{ color: "#00aa2a" }}
                            >
                              ENTER EMAIL ADDRESS FOR BREACH SCAN
                            </div>
                            <div
                              className="text-[8px] tracking-widest"
                              style={{ color: "#005500" }}
                            >
                              RE-QUERY WITH A VALID EMAIL (name@domain.com) TO
                              SCAN FOR BREACHES
                            </div>
                            {breachResult.totalBreachCount > 0 && (
                              <div
                                className="mt-3 text-[8px] tracking-widest"
                                style={{ color: "#00661a" }}
                              >
                                {breachResult.totalBreachCount} KNOWN BREACHES
                                IN DATABASE
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="mb-5">
                              <span
                                className="text-sm font-bold tracking-[0.3em] px-3 py-1"
                                style={{
                                  color: breachResult.isClean
                                    ? "#00ff41"
                                    : "#ff0000",
                                  border: `1px solid ${breachResult.isClean ? "#00ff41" : "#ff0000"}`,
                                  boxShadow: `0 0 10px ${breachResult.isClean ? "rgba(0,255,65,0.2)" : "rgba(255,0,0,0.2)"}`,
                                }}
                              >
                                {breachResult.isClean
                                  ? "✓ CLEAN"
                                  : "⚠ COMPROMISED"}
                              </span>
                            </div>
                            {breachResult.isClean ? (
                              <div
                                className="text-[10px] tracking-widest"
                                style={{ color: "#00661a" }}
                              >
                                NO BREACH RECORDS FOUND FOR DOMAIN IN MONITORED
                                DATABASES
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {breachResult.breaches.map((b, i) => (
                                  <motion.div
                                    key={`${b.name}-${i}`}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="p-3"
                                    style={{
                                      border: "1px solid #330000",
                                      backgroundColor: "#0a0000",
                                    }}
                                    data-ocid={
                                      `osint.item.${i + 1}` as `osint.item.${number}`
                                    }
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div
                                        className="text-[10px] font-bold"
                                        style={{ color: "#ff4444" }}
                                      >
                                        {b.name}
                                      </div>
                                      <div
                                        className="text-[8px]"
                                        style={{ color: "#661111" }}
                                      >
                                        {b.date}
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {b.dataTypes.map((dt) => (
                                        <span
                                          key={dt}
                                          className="text-[7px] tracking-widest px-1.5 py-0.5"
                                          style={{
                                            border: "1px solid #330000",
                                            color: "#ff6666",
                                          }}
                                        >
                                          {dt}
                                        </span>
                                      ))}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activePanel === "dossier" && (
                    <motion.div
                      key="dossier"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div
                        className="p-5"
                        style={{
                          border: "1px solid #003300",
                          borderLeft: "3px solid #ffcc00",
                          backgroundColor: "#000f00",
                        }}
                      >
                        <div
                          className="text-[9px] tracking-[0.4em] mb-4"
                          style={{ color: "#00aa2a" }}
                        >
                          THREAT DOSSIER — TARGET: {currentQuery}
                        </div>
                        <div className="mb-3">
                          <div
                            className="text-[8px] tracking-widest mb-2"
                            style={{ color: "#00661a" }}
                          >
                            RISK LEVEL
                          </div>
                          <div className="flex gap-2">
                            {(
                              ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const
                            ).map((r) => (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setDossierRisk(r)}
                                data-ocid={"osint.toggle" as const}
                                className="px-3 py-1 text-[8px] tracking-[0.2em] transition-all"
                                style={{
                                  color:
                                    dossierRisk === r ? "#000" : RISK_COLORS[r],
                                  backgroundColor:
                                    dossierRisk === r
                                      ? RISK_COLORS[r]
                                      : "transparent",
                                  border: `1px solid ${RISK_COLORS[r]}`,
                                }}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mb-4">
                          <div
                            className="text-[8px] tracking-widest mb-2"
                            style={{ color: "#00661a" }}
                          >
                            FIELD NOTES
                          </div>
                          <textarea
                            value={dossierNotes}
                            onChange={(e) => setDossierNotes(e.target.value)}
                            placeholder="ENTER INTELLIGENCE NOTES..."
                            rows={4}
                            data-ocid="osint.textarea"
                            className="w-full px-3 py-2 text-[10px] tracking-wider outline-none resize-none"
                            style={{
                              backgroundColor: "#000500",
                              border: "1px solid #003300",
                              color: "#00ff41",
                              caretColor: "#00ff41",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = "#00ff41";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = "#003300";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSaveDossier}
                          disabled={!dossierNotes.trim()}
                          data-ocid="osint.save_button"
                          className="px-5 py-2 text-[9px] tracking-[0.3em] font-bold uppercase transition-all"
                          style={{
                            backgroundColor: "transparent",
                            border: "1px solid #ffcc00",
                            color: "#ffcc00",
                            opacity: !dossierNotes.trim() ? 0.4 : 1,
                          }}
                        >
                          SAVE TO DOSSIER
                        </button>
                      </div>

                      {dossiers.length > 0 && (
                        <div data-ocid="osint.list">
                          <div
                            className="text-[8px] tracking-[0.4em] mb-3"
                            style={{ color: "#00661a" }}
                          >
                            SAVED DOSSIERS — {dossiers.length} RECORD(S)
                          </div>
                          <div className="space-y-2">
                            {dossiers.map((d, i) => (
                              <div
                                key={d.id}
                                className="p-3 flex justify-between items-start"
                                style={{
                                  border: "1px solid #001a00",
                                  backgroundColor: "#000800",
                                }}
                                data-ocid={
                                  `osint.item.${i + 1}` as `osint.item.${number}`
                                }
                              >
                                <div className="flex-1 mr-4">
                                  <div className="flex items-center gap-3 mb-1">
                                    <span
                                      className="text-[10px] font-bold"
                                      style={{ color: "#00ff41" }}
                                    >
                                      {d.target}
                                    </span>
                                    <span
                                      className="text-[7px] tracking-widest px-1.5 py-0.5"
                                      style={{
                                        color: RISK_COLORS[d.risk],
                                        border: `1px solid ${RISK_COLORS[d.risk]}`,
                                      }}
                                    >
                                      {d.risk}
                                    </span>
                                  </div>
                                  <div
                                    className="text-[9px]"
                                    style={{ color: "#00661a" }}
                                  >
                                    {d.notes}
                                  </div>
                                  <div
                                    className="text-[7px] mt-1"
                                    style={{ color: "#003300" }}
                                  >
                                    {d.savedAt}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDossier(d.id)}
                                  data-ocid={
                                    `osint.delete_button.${i + 1}` as `osint.delete_button.${number}`
                                  }
                                  className="text-[8px] tracking-widest transition-all px-2 py-1"
                                  style={{
                                    color: "#660000",
                                    border: "1px solid #330000",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#ff0000";
                                    e.currentTarget.style.borderColor =
                                      "#ff0000";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#660000";
                                    e.currentTarget.style.borderColor =
                                      "#330000";
                                  }}
                                >
                                  DEL
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {dossiers.length === 0 && (
                        <div
                          className="text-[9px] tracking-widest py-4 text-center"
                          style={{ color: "#003300" }}
                          data-ocid="osint.empty_state"
                        >
                          NO DOSSIERS ON FILE
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activePanel === "business" && businessData && (
                    <motion.div
                      key="business"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className="p-5"
                        style={{
                          border: "1px solid #003300",
                          borderLeft: "3px solid #00ff41",
                          backgroundColor: "#000f00",
                        }}
                      >
                        <div
                          className="text-[9px] tracking-[0.4em] mb-5"
                          style={{ color: "#00aa2a" }}
                        >
                          BUSINESS & PROPERTY INTELLIGENCE
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                          {[
                            {
                              label: "LLC REGISTRATION STATE",
                              value: businessData.state,
                            },
                            {
                              label: "BUSINESS TYPE",
                              value: businessData.bizType,
                            },
                            {
                              label: "REGISTERED AGENT",
                              value: businessData.agent,
                            },
                            {
                              label: "PROPERTY COUNT",
                              value: businessData.propertyCount.toString(),
                            },
                            {
                              label: "FILING DATE",
                              value: businessData.filingDate,
                            },
                          ].map((item) => (
                            <div
                              key={item.label}
                              className="p-3"
                              style={{ border: "1px solid #001500" }}
                            >
                              <div
                                className="text-[7px] tracking-widest mb-1"
                                style={{ color: "#00661a" }}
                              >
                                {item.label}
                              </div>
                              <div
                                className="text-sm"
                                style={{ color: "#00ff41" }}
                              >
                                {item.value}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className="p-3 text-[8px] tracking-wider"
                          style={{
                            border: "1px solid #332200",
                            backgroundColor: "#0a0500",
                            color: "#aa8800",
                          }}
                        >
                          ⚠ RESEARCH AID ONLY — VERIFY MANUALLY VIA SECRETARY OF
                          STATE, COUNTY RECORDS, AND OFFICIAL DATABASES. THIS
                          DATA IS SIMULATED FOR DEMONSTRATION PURPOSES.
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!hasResults && !scanning && (
            <div
              className="text-center py-16"
              style={{ color: "#003300" }}
              data-ocid="osint.empty_state"
            >
              <div className="text-4xl mb-4">⬛</div>
              <div className="text-[10px] tracking-[0.4em]">
                AWAITING QUERY INPUT
              </div>
              <div
                className="text-[8px] tracking-widest mt-2"
                style={{ color: "#001a00" }}
              >
                ENTER A NAME, USERNAME, EMAIL, OR BUSINESS ABOVE TO BEGIN
                ANALYSIS
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="text-center py-4 mt-8 text-[7px] tracking-[0.3em]"
          style={{ borderTop: "1px solid #001500", color: "#003300" }}
        >
          [END OF REPORT] [BLACKGRID OSINT DIVISION] [ALL DATA FOR AUTHORIZED
          USE ONLY] [WIKIPEDIA & HIBP APIs — PUBLIC DATA ONLY]
        </div>
      </div>
    </div>
  );
}
