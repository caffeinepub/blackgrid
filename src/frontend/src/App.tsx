import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import DashboardTab from "./components/DashboardTab";
import IntelligenceTab from "./components/IntelligenceTab";
import LandingPage from "./components/LandingPage";
import ShieldTab from "./components/ShieldTab";
import WatchlistTab from "./components/WatchlistTab";
import { useInternetIdentity } from "./hooks/useInternetIdentity";

type Tab = "dashboard" | "watchlist" | "intelligence" | "shield";

const NAV_TABS: { id: Tab; label: string }[] = [
  { id: "intelligence", label: "INTELLIGENCE" },
  { id: "dashboard", label: "DASHBOARD" },
  { id: "shield", label: "SHIELD" },
  { id: "watchlist", label: "WATCHLIST" },
];

function Navbar({
  activeTab,
  onTabChange,
}: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  const { identity, login, clear } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
      style={{
        backgroundColor: "#0A0A0A",
        borderBottom: "1px solid rgba(201,169,92,0.2)",
      }}
    >
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <img
          src="/assets/generated/blackgrid-logo-transparent.dim_200x200.png"
          alt="BLACKGRID"
          className="w-7 h-7 object-contain"
        />
        <span className="text-base font-bold tracking-widest uppercase text-[#C9A95C] hidden sm:block">
          BLACKGRID
        </span>
      </div>

      {isAuthenticated && (
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_TABS.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-ocid={`nav.${tab.id}.link`}
              className={`px-4 py-1.5 text-[10px] tracking-widest uppercase transition-all ${
                activeTab === tab.id
                  ? "text-[#C9A95C] border-b border-[#C9A95C]"
                  : "text-[#8A8A8A] hover:text-[#EDEDED]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      )}

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
              <span className="text-[10px] tracking-widest uppercase text-[#2ECC71]">
                ACTIVE
              </span>
            </div>
            <button
              type="button"
              onClick={() => onTabChange("shield")}
              data-ocid="nav.shield.primary_button"
              className="px-4 py-1.5 bg-[#C9A95C] text-[#0A0A0A] text-[9px] tracking-widest uppercase font-bold hover:bg-[#E8C878] transition-all hidden sm:block"
            >
              ACTIVATE SHIELD
            </button>
            <button
              type="button"
              onClick={clear}
              data-ocid="nav.logout.button"
              className="px-3 py-1.5 border border-[#2A2A2A] text-[#8A8A8A] text-[9px] tracking-widest uppercase hover:border-[#C00000] hover:text-[#C00000] transition-all"
            >
              LOGOUT
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={login}
            data-ocid="nav.login.primary_button"
            className="px-5 py-1.5 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-widest uppercase font-bold hover:bg-[#E8C878] transition-all"
          >
            ACCESS
          </button>
        )}
      </div>
    </header>
  );
}

function MobileNav({
  activeTab,
  onTabChange,
}: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  if (!isAuthenticated) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex"
      style={{
        backgroundColor: "#0A0A0A",
        borderTop: "1px solid rgba(201,169,92,0.15)",
      }}
    >
      {NAV_TABS.map((tab) => (
        <button
          type="button"
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          data-ocid={`mobile_nav.${tab.id}.link`}
          className={`flex-1 py-3 text-[8px] tracking-widest uppercase transition-all ${
            activeTab === tab.id ? "text-[#C9A95C]" : "text-[#8A8A8A]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as Tab);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-14"
          >
            <LandingPage onLogin={login} onTabChange={handleTabChange} />
          </motion.main>
        ) : (
          <motion.main
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-14 pb-16 md:pb-0"
          >
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
              <AnimatePresence mode="wait">
                {activeTab === "dashboard" && (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DashboardTab onTabChange={handleTabChange} />
                  </motion.div>
                )}
                {activeTab === "watchlist" && (
                  <motion.div
                    key="watchlist"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <WatchlistTab />
                  </motion.div>
                )}
                {activeTab === "intelligence" && (
                  <motion.div
                    key="intelligence"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IntelligenceTab />
                  </motion.div>
                )}
                {activeTab === "shield" && (
                  <motion.div
                    key="shield"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ShieldTab />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster />
    </div>
  );
}
