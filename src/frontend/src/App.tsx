import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
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

const ADMIN_PASSCODE = "BLACKGRID_ELITE_2024";
const STORAGE_KEY = "bg_admin_override";

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

const LOCKED_TABS: Tab[] = [
  "dashboard",
  "shield",
  "profile",

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

function AdminPasscodeModal({
  isOpen,
  onClose,
  overrideActive,
  onGrant,
  onRevoke,
}: {
  isOpen: boolean;
  onClose: () => void;
  overrideActive: boolean;
  onGrant: (code: string) => boolean;
  onRevoke: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleGrant = () => {
    const success = onGrant(code);
    if (success) {
      setCode("");
      setError("");
      onClose();
    } else {
      setError("INVALID CODE");
    }
  };

  const handleRevoke = () => {
    onRevoke();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      data-ocid="admin_modal.modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="relative w-full max-w-sm mx-4 p-8"
        style={{
          backgroundColor: "#0A0A0A",
          border: "1px solid rgba(201,169,92,0.5)",
          boxShadow: "0 0 40px rgba(201,169,92,0.15)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          data-ocid="admin_modal.close_button"
          className="absolute top-4 right-4 text-[#6A6A6A] hover:text-[#C9A95C] transition-colors text-lg leading-none"
        >
          ✕
        </button>

        <div className="mb-6">
          <p className="text-[9px] tracking-[0.4em] text-[#6A6A6A] uppercase mb-1">
            BLACKGRID
          </p>
          <h2
            className="text-[#C9A95C] text-xl font-bold uppercase"
            style={{ letterSpacing: "0.2em" }}
          >
            ADMIN ACCESS
          </h2>
        </div>

        {overrideActive && (
          <div className="mb-5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#2ECC71] font-semibold">
              ADMIN OVERRIDE ACTIVE
            </span>
          </div>
        )}

        <div className="mb-4">
          <label
            htmlFor="admin-passcode-input"
            className="block text-[9px] tracking-[0.3em] uppercase text-[#6A6A6A] mb-2"
          >
            ACCESS CODE
          </label>
          <input
            id="admin-passcode-input"
            type="password"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleGrant();
            }}
            placeholder="Enter passcode"
            data-ocid="admin_modal.input"
            className="w-full px-4 py-3 bg-transparent text-[#EDEDED] text-sm placeholder-[#3A3A3A] outline-none"
            style={{ border: "1px solid rgba(201,169,92,0.4)" }}
          />
          {error && (
            <p
              className="mt-2 text-[10px] tracking-widest uppercase text-[#CC3333]"
              data-ocid="admin_modal.error_state"
            >
              {error}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleGrant}
          data-ocid="admin_modal.submit_button"
          className="w-full py-3 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-[0.25em] uppercase font-bold hover:bg-[#E8C878] transition-all mb-3"
        >
          GRANT ACCESS
        </button>

        {overrideActive && (
          <button
            type="button"
            onClick={handleRevoke}
            data-ocid="admin_modal.delete_button"
            className="w-full py-2 border text-[10px] tracking-[0.2em] uppercase font-bold transition-all"
            style={{ borderColor: "rgba(122,0,0,0.6)", color: "#CC4444" }}
          >
            REVOKE OVERRIDE
          </button>
        )}
      </motion.div>
    </div>
  );
}

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
          membership. Intelligence Feed and Sex Offender Registry are free — all
          other features require Elite membership.
        </p>

        <ul className="space-y-2 mb-8">
          {[
            "Live Threat Grid Dashboard",
            "Route Defense & Safe Passages",
            "Watchlist & Network Directory",
            "Identity Badge & Profile",
            "Network Directory",
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

function BlackTierGate() {
  return (
    <motion.div
      key="black-tier-gate"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="flex items-center justify-center min-h-[60vh]"
      data-ocid="black_tier_gate.panel"
    >
      <div
        className="max-w-md w-full mx-auto p-8"
        style={{
          background: "#0A0A0A",
          border: "1px solid rgba(201,169,92,0.6)",
          boxShadow:
            "0 0 40px rgba(201,169,92,0.18), 0 0 6px rgba(201,169,92,0.1)",
        }}
      >
        <div className="mb-2">
          <p className="text-[9px] tracking-[0.45em] text-[#6A6A6A] uppercase mb-3">
            BLACKGRID VANTA
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[#C9A95C] text-2xl">⬛</span>
            <h2
              className="text-[#C9A95C] text-lg font-bold uppercase"
              style={{ letterSpacing: "0.25em" }}
            >
              BLACK TIER REQUIRED
            </h2>
          </div>
        </div>

        <p className="text-[#8A8A8A] text-sm tracking-wide mb-6 leading-relaxed">
          Hiring bodyguards is exclusively available to{" "}
          <span className="text-[#C9A95C] font-semibold">Black Tier</span>{" "}
          members. Black Tier membership is invite-only ($300+). Once your
          membership is confirmed by email, you become a{" "}
          <span className="text-[#C9A95C] font-semibold">
            Blackgrid Vanta Power Tier
          </span>{" "}
          member with full access to hire bodyguards anywhere.
        </p>

        <ul className="space-y-2 mb-8">
          {[
            "Invite-only ($300+ membership)",
            "24–72 hours advance notice for assignments",
            "Armed & unarmed operatives available",
            "Deploy guards anywhere you go",
            "Become a Vanta Power Tier Ambassador",
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <span className="text-[#C9A95C] text-xs">▸</span>
              <span className="text-[#AAAAAA] text-xs tracking-widest uppercase">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <a
          href="mailto:acgagc7@gmail.com?subject=Black Tier Application"
          data-ocid="black_tier_gate.primary_button"
          className="block w-full py-3 bg-[#C9A95C] text-[#0A0A0A] text-xs tracking-[0.25em] uppercase font-bold hover:bg-[#E8C878] transition-all text-center"
        >
          APPLY FOR BLACK TIER
        </a>
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
  onLogoClick,
}: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  showNav: boolean;
  pendingCount: number;
  onLogin?: () => void;
  isPaid?: boolean;
  onLogoClick?: () => void;
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
        <button
          type="button"
          className="text-base font-bold uppercase text-[#C9A95C] cursor-pointer select-none bg-transparent border-none p-0"
          style={{ letterSpacing: "0.25em" }}
          onClick={onLogoClick}
          data-ocid="nav.logo.button"
        >
          BLACKGRID
        </button>
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onTabChange("registry")}
              data-ocid="nav.registry.link"
              className={`px-3 py-1.5 text-[9px] tracking-widest uppercase transition-all ${
                activeTab === "registry"
                  ? "text-[#C9A95C] border-b border-[#C9A95C]"
                  : "text-[#8A8A8A] hover:text-[#C9A95C]"
              }`}
            >
              REGISTRY
            </button>
            <button
              type="button"
              onClick={handleLogin}
              data-ocid="nav.login.primary_button"
              className="px-5 py-1.5 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-widest uppercase font-bold hover:bg-[#E8C878] transition-all"
            >
              ACCESS
            </button>
          </div>
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
  overrideAdmin,
}: {
  children: (isPaid: boolean, isAdmin: boolean) => React.ReactNode;
  overrideAdmin?: boolean;
}) {
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: isApproved, isLoading: approvedLoading } =
    useIsCallerApproved();

  const isLoading = approvedLoading || adminLoading;

  if (overrideAdmin) {
    return <>{children(true, true)}</>;
  }

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
  onLogoClick,
}: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  pendingCount: number;
  setPendingCount: (n: number) => void;
  isPaid: boolean;
  isAdmin: boolean;
  onLogoClick?: () => void;
}) {
  const handleTabChange = (tab: string) => {
    const t = tab as Tab;
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
        onLogoClick={onLogoClick}
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
              ) : !isAdmin ? (
                <BlackTierGate key="black-tier-gate" />
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
  const [localAdminOverride, setLocalAdminOverride] = useState(
    () => localStorage.getItem(STORAGE_KEY) === ADMIN_PASSCODE,
  );
  const [modalOpen, setModalOpen] = useState(false);

  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 3000);
    if (clickCountRef.current >= 5) {
      clickCountRef.current = 0;
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      setModalOpen(true);
    }
  };

  const handleGrant = (code: string): boolean => {
    if (code === ADMIN_PASSCODE) {
      localStorage.setItem(STORAGE_KEY, ADMIN_PASSCODE);
      setLocalAdminOverride(true);
      return true;
    }
    return false;
  };

  const handleRevoke = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLocalAdminOverride(false);
  };

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
            key="unauthenticated"
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
              onLogoClick={handleLogoClick}
            />
            <main className="pt-14">
              {activeTab === "registry" ? (
                <OffenderRegistry />
              ) : (
                <LandingPage
                  onLogin={login}
                  onTabChange={(tab) => setActiveTab(tab as Tab)}
                />
              )}
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
            <AccessGate overrideAdmin={localAdminOverride}>
              {(isPaid, isAdmin) => (
                <AuthenticatedApp
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  pendingCount={pendingCount}
                  setPendingCount={setPendingCount}
                  isPaid={isPaid}
                  isAdmin={isAdmin}
                  onLogoClick={handleLogoClick}
                />
              )}
            </AccessGate>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && (
          <AdminPasscodeModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            overrideActive={localAdminOverride}
            onGrant={handleGrant}
            onRevoke={handleRevoke}
          />
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}
