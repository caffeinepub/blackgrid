import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ApprovalStatus } from "./backend.d";
import AdminPanel from "./components/AdminPanel";
import BodyguardDirectory from "./components/BodyguardDirectory";
import DashboardTab from "./components/DashboardTab";
import IntelligenceTab from "./components/IntelligenceTab";
import LandingPage from "./components/LandingPage";
import NetworkTab from "./components/NetworkTab";
import OffenderRegistry from "./components/OffenderRegistry";
import PaymentFailure from "./components/PaymentFailure";
import PaymentSuccess from "./components/PaymentSuccess";
import ProfileTab from "./components/ProfileTab";
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
  | "subscription"
  | "profile"
  | "network"
  | "guards";

const _FREE_TABS: Tab[] = ["intelligence", "subscription"];
const LOCKED_TABS: Tab[] = [
  "dashboard",
  "shield",
  "profile",
  "registry",
  "network",
  "guards",
  "watchlist",
];

const NAV_TABS: { id: Tab; label: string }[] = [
  { id: "intelligence", label: "INTELLIGENCE" },
  { id: "dashboard", label: "DASHBOARD" },
  { id: "shield", label: "SHIELD" },
  { id: "profile", label: "PROFILE" },
  { id: "registry", label: "REGISTRY" },
  { id: "network", label: "NETWORK" },
  { id: "guards", label: "GUARDS" },
  { id: "watchlist", label: "WATCHLIST" },
  { id: "subscription", label: "SUBSCRIPTION" },
];

function ElitePaywall({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <motion.div
      key="paywall"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-center min-h-[60vh]"
      data-ocid="paywall.panel"
    >
      <div
        className="max-w-md w-full mx-auto p-8"
        style={{
          background: "#0A0A0A",
          border: "1px solid rgba(201,169,92,0.45)",
          boxShadow:
            "0 0 32px rgba(201,169,92,0.12), 0 0 4px rgba(201,169,92,0.08)",
        }}
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="text-[#C9A95C] text-2xl">🔒</span>
          <h2
            className="text-[#C9A95C] text-lg font-bold uppercase"
            style={{ letterSpacing: "0.25em" }}
          >
            ELITE ACCESS REQUIRED
          </h2>
        </div>

        <p className="text-[#8A8A8A] text-sm tracking-wide mb-6">
          This feature requires an active{" "}
          <span className="text-[#C9A95C] font-semibold">BLACKGRID Elite</span>{" "}
          membership.
        </p>

        <ul className="space-y-2 mb-8">
          {[
            "Live Threat Grid Dashboard",
            "Route Defense & Safe Passages",
            "Offender Registry Access",
            "Watchlist & Network Directory",
            "Guard Network — Hire Bodyguards",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="text-[#C9A95C] text-xs">▸</span>
              <span className="text-[#AAAAAA] text-xs tracking-widest uppercase">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onUpgrade}
          data-ocid="paywall.primary_button"
          className="w-full py-3 bg-[#C9A95C] text-[#0A0A0A] text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#E8C878] transition-all"
        >
          UPGRADE NOW — $100.00/MO
        </button>
      </div>
    </motion.div>
  );
}

function Navbar({
  activeTab,
  onTabChange,
  showNav,
  pendingCount,
  onLogin,
  isPaid,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  showNav: boolean;
  pendingCount: number;
  onLogin?: () => void;
  isPaid?: boolean;
}) {
  const { identity, login, clear } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const handleLogin = onLogin ?? login;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-14"
      style={{
        backgroundColor: "#0A0A0A",
        borderBottom: "1px solid rgba(201,169,92,0.2)",
      }}
    >
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span
          className="text-base font-bold uppercase text-[#C9A95C]"
          style={{ letterSpacing: "0.25em" }}
        >
          BLACKGRID
        </span>
      </div>

      {isAuthenticated && showNav && (
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_TABS.map((tab) => {
            const isLocked = !isPaid && LOCKED_TABS.includes(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                data-ocid={`nav.${tab.id}.link`}
                className={`relative px-4 py-1.5 text-[10px] tracking-widest uppercase transition-all ${
                  isActive
                    ? "text-[#C9A95C] border-b border-[#C9A95C]"
                    : isLocked
                      ? "text-[#4A4A4A] hover:text-[#6A6A6A]"
                      : "text-[#8A8A8A] hover:text-[#EDEDED]"
                }`}
              >
                {tab.label}
                {isLocked && (
                  <span className="ml-1 text-[#C9A95C] opacity-60 text-[9px]">
                    🔒
                  </span>
                )}
                {tab.id === "subscription" && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#CC3333] animate-pulse" />
                )}
              </button>
            );
          })}
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
            onClick={handleLogin}
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
  isPaid,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  pendingCount: number;
  isPaid?: boolean;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex overflow-x-auto"
      style={{
        backgroundColor: "#0A0A0A",
        borderTop: "1px solid rgba(201,169,92,0.15)",
      }}
    >
      {NAV_TABS.map((tab) => {
        const isLocked = !isPaid && LOCKED_TABS.includes(tab.id);
        return (
          <button
            type="button"
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            data-ocid={`mobile_nav.${tab.id}.link`}
            className={`relative flex-1 py-3 text-[7px] tracking-widest uppercase transition-all min-w-[3rem] ${
              activeTab === tab.id
                ? "text-[#C9A95C]"
                : isLocked
                  ? "text-[#3A3A3A]"
                  : "text-[#8A8A8A]"
            }`}
          >
            {tab.label}
            {isLocked && (
              <span className="block text-[7px] text-[#C9A95C] opacity-50">
                🔒
              </span>
            )}
            {tab.id === "subscription" && pendingCount > 0 && (
              <span className="absolute top-1.5 right-1/4 w-1.5 h-1.5 rounded-full bg-[#CC3333] animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

function AccessGate({
  children,
}: {
  children: (isPaid: boolean, isAdmin: boolean) => React.ReactNode;
}) {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: isApproved, isLoading: approvedLoading } =
    useIsCallerApproved();

  const isLoading = approvedLoading || adminLoading;

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 z-40 flex flex-col items-center justify-center"
        style={{ backgroundColor: "#0A0A0A" }}
        data-ocid="access_gate.loading_state"
      >
        <div className="flex flex-col items-center gap-4">
          <span
            className="text-2xl font-bold uppercase text-[#C9A95C]"
            style={{ letterSpacing: "0.25em" }}
          >
            BLACKGRID
          </span>
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

  const adminBool = !!isAdmin;
  const isPaid = !!(adminBool || isApproved);
  return <>{children(isPaid, adminBool)}</>;
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

  if (pendingCount !== undefined) {
    onPendingCount(pendingCount);
  }

  return null;
}

function AuthenticatedApp({
  activeTab,
  setActiveTab,
  pendingCount,
  setPendingCount,
  isPaid,
  isAdmin,
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  pendingCount: number;
  setPendingCount: (n: number) => void;
  isPaid: boolean;
  isAdmin: boolean;
}) {
  const handleTabChange = (tab: string) => {
    const t = tab as Tab;
    // If free user tries a locked tab, redirect to subscription
    if (!isPaid && LOCKED_TABS.includes(t)) {
      setActiveTab("subscription");
      return;
    }
    setActiveTab(t);
  };

  const isTabLocked = (tab: Tab) => !isPaid && LOCKED_TABS.includes(tab);

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showNav={true}
        pendingCount={pendingCount}
        isPaid={isPaid}
      />
      <PendingNotificationTracker onPendingCount={setPendingCount} />
      <div className="pt-14 pb-16 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" &&
              (isTabLocked("dashboard") ? (
                <ElitePaywall
                  key="paywall-dashboard"
                  onUpgrade={() => setActiveTab("subscription")}
                />
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <DashboardTab onTabChange={handleTabChange} />
                </motion.div>
              ))}
            {activeTab === "watchlist" &&
              (isTabLocked("watchlist") ? (
                <ElitePaywall
                  key="paywall-watchlist"
                  onUpgrade={() => setActiveTab("subscription")}
                />
              ) : (
                <motion.div
                  key="watchlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <WatchlistTab />
                </motion.div>
              ))}
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
            {activeTab === "shield" &&
              (isTabLocked("shield") ? (
                <ElitePaywall
                  key="paywall-shield"
                  onUpgrade={() => setActiveTab("subscription")}
                />
              ) : (
                <motion.div
                  key="shield"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ShieldTab />
                </motion.div>
              ))}
            {activeTab === "registry" &&
              (isTabLocked("registry") ? (
                <ElitePaywall
                  key="paywall-registry"
                  onUpgrade={() => setActiveTab("subscription")}
                />
              ) : (
                <motion.div
                  key="registry"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <OffenderRegistry />
                </motion.div>
              ))}
            {activeTab === "profile" &&
              (isTabLocked("profile") ? (
                <ElitePaywall
                  key="paywall-profile"
                  onUpgrade={() => setActiveTab("subscription")}
                />
              ) : (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileTab isAdmin={isAdmin} />
                </motion.div>
              ))}
            {activeTab === "network" &&
              (isTabLocked("network") ? (
                <ElitePaywall
                  key="paywall-network"
                  onUpgrade={() => setActiveTab("subscription")}
                />
              ) : (
                <motion.div
                  key="network"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <NetworkTab />
                </motion.div>
              ))}
            {activeTab === "guards" &&
              (isTabLocked("guards") ? (
                <ElitePaywall
                  key="paywall-guards"
                  onUpgrade={() => setActiveTab("subscription")}
                />
              ) : (
                <motion.div
                  key="guards"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <BodyguardDirectory />
                </motion.div>
              ))}
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
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingCount={pendingCount}
        isPaid={isPaid}
      />
    </>
  );
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

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Navbar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showNav={false}
              pendingCount={0}
            />
            <main className="pt-14">
              <LandingPage
                onLogin={login}
                onTabChange={(tab) => setActiveTab(tab as Tab)}
              />
            </main>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AccessGate>
              {(isPaid, isAdmin) => (
                <AuthenticatedApp
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  pendingCount={pendingCount}
                  setPendingCount={setPendingCount}
                  isPaid={isPaid}
                  isAdmin={isAdmin}
                />
              )}
            </AccessGate>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster />
    </div>
  );
}
