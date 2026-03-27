import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ApprovalStatus } from "./backend.d";
import AdminPanel from "./components/AdminPanel";
import DashboardTab from "./components/DashboardTab";
import IntelligenceTab from "./components/IntelligenceTab";
import LandingPage from "./components/LandingPage";
import OffenderRegistry from "./components/OffenderRegistry";
import PaymentFailure from "./components/PaymentFailure";
import PaymentGate from "./components/PaymentGate";
import PaymentSuccess from "./components/PaymentSuccess";
import ShieldTab from "./components/ShieldTab";
import SubscriptionPage from "./components/SubscriptionPage";
import WatchlistTab from "./components/WatchlistTab";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useIsCallerAdmin,
  useIsCallerApproved,
  useListApprovals,
} from "./hooks/useQueries";

type Tab =
  | "dashboard"
  | "watchlist"
  | "intelligence"
  | "shield"
  | "registry"
  | "subscription";

const NAV_TABS: { id: Tab; label: string }[] = [
  { id: "intelligence", label: "INTELLIGENCE" },
  { id: "dashboard", label: "DASHBOARD" },
  { id: "shield", label: "SHIELD" },
  { id: "registry", label: "REGISTRY" },
  { id: "watchlist", label: "WATCHLIST" },
  { id: "subscription", label: "SUBSCRIPTION" },
];

function Navbar({
  activeTab,
  onTabChange,
  showNav,
  pendingCount,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  showNav: boolean;
  pendingCount: number;
}) {
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

      {isAuthenticated && showNav && (
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
              className={`relative px-4 py-1.5 text-[10px] tracking-widest uppercase transition-all ${
                activeTab === tab.id
                  ? "text-[#C9A95C] border-b border-[#C9A95C]"
                  : "text-[#8A8A8A] hover:text-[#EDEDED]"
              }`}
            >
              {tab.label}
              {tab.id === "subscription" && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#CC3333] animate-pulse" />
              )}
            </button>
          ))}
        </nav>
      )}

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            {showNav && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
                <span className="text-[10px] tracking-widest uppercase text-[#2ECC71]">
                  ACTIVE
                </span>
              </div>
            )}
            {showNav && (
              <button
                type="button"
                onClick={() => onTabChange("shield")}
                data-ocid="nav.shield.primary_button"
                className="px-4 py-1.5 bg-[#C9A95C] text-[#0A0A0A] text-[9px] tracking-widest uppercase font-bold hover:bg-[#E8C878] transition-all hidden sm:block"
              >
                ACTIVATE SHIELD
              </button>
            )}
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
  pendingCount,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  pendingCount: number;
}) {
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
          className={`relative flex-1 py-3 text-[7px] tracking-widest uppercase transition-all ${
            activeTab === tab.id ? "text-[#C9A95C]" : "text-[#8A8A8A]"
          }`}
        >
          {tab.label}
          {tab.id === "subscription" && pendingCount > 0 && (
            <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 rounded-full bg-[#CC3333] animate-pulse" />
          )}
        </button>
      ))}
    </nav>
  );
}

function AccessGate({ children }: { children: React.ReactNode }) {
  const { data: isApproved, isLoading: approvedLoading } =
    useIsCallerApproved();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isLoading = approvedLoading || adminLoading;

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center"
        style={{ backgroundColor: "#0A0A0A" }}
        data-ocid="access_gate.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/blackgrid-logo-transparent.dim_200x200.png"
            alt="BLACKGRID"
            className="w-10 h-10 object-contain opacity-80"
          />
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#C9A95C] animate-pulse" />
            <span className="text-[9px] tracking-[0.3em] uppercase text-[#C9A95C]">
              VERIFYING ACCESS
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin || isApproved) {
    return <>{children}</>;
  }

  return <PaymentGate />;
}

function PendingNotificationTracker({
  onPendingCount,
}: {
  onPendingCount: (count: number) => void;
}) {
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: approvals } = useListApprovals();

  const pendingCount =
    isAdmin && approvals
      ? approvals.filter((a) => a.status === ApprovalStatus.pending).length
      : 0;

  // Use a ref-style side effect on render — derived state, no effect needed
  if (pendingCount !== undefined) {
    onPendingCount(pendingCount);
  }

  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [pendingCount, setPendingCount] = useState(0);
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const pathname = window.location.pathname;

  if (pathname === "/payment-success") {
    return (
      <>
        <PaymentSuccess />
        <Toaster />
      </>
    );
  }

  if (pathname === "/payment-failure") {
    return (
      <>
        <PaymentFailure />
        <Toaster />
      </>
    );
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as Tab);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showNav={isAuthenticated}
        pendingCount={pendingCount}
      />

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
          >
            <AccessGate>
              <PendingNotificationTracker onPendingCount={setPendingCount} />
              <div className="pt-14 pb-16 md:pb-0">
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
                    {activeTab === "registry" && (
                      <motion.div
                        key="registry"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <OffenderRegistry />
                      </motion.div>
                    )}
                    {activeTab === "subscription" && (
                      <motion.div
                        key="subscription"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <SubscriptionPage />
                        <AdminPanel />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </AccessGate>
          </motion.main>
        )}
      </AnimatePresence>

      {isAuthenticated && (
        <MobileNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingCount}
        />
      )}
      <Toaster />
    </div>
  );
}
