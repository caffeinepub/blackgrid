import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Check,
  Eye,
  FileSearch,
  Lock,
  MapPin,
  Navigation,
  Shield,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { getSessionParameter, storeSessionParameter } from "../utils/urlParams";
import AlertTicker from "./AlertTicker";
import KPIRow from "./KPIRow";
import LiveMap from "./LiveMap";
import TutorialOverlay from "./TutorialOverlay";

interface LandingPageProps {
  onLogin: () => void;
  onTabChange?: (tab: string) => void;
}

const FEATURES: {
  icon: React.ElementType;
  title: string;
  desc: string;
  tab: string;
}[] = [
  {
    icon: MapPin,
    title: "Live Threat Grid Map",
    desc: "Blacked-out SF map with real-time risk zones, verified users, blind spots, and labeled street names for situational awareness.",
    tab: "dashboard",
  },
  {
    icon: Navigation,
    title: "Route Defense",
    desc: "GPS-powered safest route suggestions. Live tracking, compass heading, auto-recalculation around high-crime zones, and turn-by-turn steps.",
    tab: "shield",
  },
  {
    icon: FileSearch,
    title: "Sex Offender Registry",
    desc: "Active SF-area registry with Tier I/II/III badges, mugshots, offense types, and neighborhood locations. Searchable and filterable.",
    tab: "registry",
  },
  {
    icon: Zap,
    title: "Intelligence Feed",
    desc: "Live incident data from SFPD public reports and local emergency feeds. Free tier available — upgrade for full real-time access.",
    tab: "intelligence",
  },
  {
    icon: Shield,
    title: "Black Tier Bodyguard Hiring",
    desc: "Hire vetted SF operatives directly from the app. Armed or unarmed. Variable pricing based on number of guards and hours. Invite-only.",
    tab: "guards",
  },
  {
    icon: Lock,
    title: "Secure Identity Badge & QR",
    desc: "Consent-based encrypted ID badge sharing via QR scan or phone tap. Verified identity for your network of trusted operatives.",
    tab: "profile",
  },
  {
    icon: Users,
    title: "Network Directory",
    desc: "Connect with verified operatives in your area. View trust scores, badges, and add contacts to your personal watchlist.",
    tab: "network",
  },
  {
    icon: AlertTriangle,
    title: "Personal Watchlist",
    desc: "Add and monitor contacts of concern. Custom notes, threat levels, and instant alerts when watchlist contacts are flagged.",
    tab: "watchlist",
  },
  {
    icon: Eye,
    title: "Emergency Services",
    desc: "One-tap SOS with GPS coordinates, 911 quick-dial, SF non-emergency line, crisis text line, and call-a-car to exit any situation.",
    tab: "dashboard",
  },
];

const PRICING: {
  tier: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
  style: string;
  badge?: string;
  targetTab: string;
}[] = [
  {
    tier: "FREE",
    price: "$0",
    period: "",
    desc: "Situational awareness, no cost",
    features: [
      "Intelligence Feed (live incidents)",
      "Public incident map",
      "SF area alerts",
      "Sex Offender Registry (free, no login)",
    ],
    cta: "GET STARTED",
    style: "default",
    targetTab: "intelligence",
  },
  {
    tier: "ELITE",
    price: "$100",
    period: "one-time · then $25/mo",
    desc: "Full platform access",
    features: [
      "Live Threat Grid Dashboard",
      "Route Defense with GPS",
      "Watchlist (unlimited contacts)",
      "Secure Identity Badge & QR",
      "Network Directory",
      "Profile creation",
    ],
    cta: "ACTIVATE ELITE",
    style: "gold",
    badge: "MOST POPULAR",
    targetTab: "subscription",
  },
  {
    tier: "BLACK TIER",
    price: "$300+",
    period: "one-time · then $50/mo · invite only",
    desc: "Bodyguard hiring program",
    features: [
      "All Elite features",
      "Vetted SF operatives",
      "Armed & unarmed guards",
      "Live guard location map",
      "Variable pricing calculator",
      "Vanta Power Tier status",
    ],
    cta: "REQUEST INVITE",
    style: "black",
    badge: "INVITE ONLY",
    targetTab: "guards",
  },
];

type ModalType =
  | null
  | "privacy"
  | "terms"
  | "security"
  | "contact"
  | "adminSetup";

const CURRENT_YEAR = new Date().getFullYear();

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[#EDEDED] uppercase tracking-wider text-xs font-bold mt-6 mb-2">
      {children}
    </h3>
  );
}

function BodyText({ children }: { children: React.ReactNode }) {
  return <p className="text-[#8A8A8A] text-xs leading-relaxed">{children}</p>;
}

function PrivacyPolicyContent() {
  return (
    <div className="space-y-1">
      <BodyText>
        Last updated: {CURRENT_YEAR}. BLACKGRID is committed to protecting your
        privacy and personal data with military-grade security practices.
      </BodyText>

      <SectionHeading>1. Data We Collect</SectionHeading>
      <BodyText>
        BLACKGRID collects only what is necessary for your protection and is
        strictly opt-in:
      </BodyText>
      <ul className="text-[#8A8A8A] text-xs leading-relaxed list-disc list-inside space-y-1 mt-2">
        <li>
          <span className="text-[#B8B8B8]">Location Data:</span> Real-time
          location used solely for threat mapping and route defense. Never
          stored beyond your active session without explicit consent.
        </li>
        <li>
          <span className="text-[#B8B8B8]">Identity Verification Data:</span>{" "}
          Opt-in only. Encrypted identity badges shared only with your explicit
          consent via QR or NFC tap.
        </li>
        <li>
          <span className="text-[#B8B8B8]">Usage Data:</span> Anonymized app
          interaction data used to improve service reliability. No personally
          identifiable information is linked.
        </li>
        <li>
          <span className="text-[#B8B8B8]">Watchlist Entries:</span> Private and
          encrypted. Accessible only to you. Never shared with third parties.
        </li>
      </ul>

      <SectionHeading>2. How We Use Your Data</SectionHeading>
      <BodyText>
        Your data is used exclusively to power BLACKGRID services:
      </BodyText>
      <ul className="text-[#8A8A8A] text-xs leading-relaxed list-disc list-inside space-y-1 mt-2">
        <li>Real-time threat detection and risk zone mapping</li>
        <li>Route defense and safe-path generation</li>
        <li>Consent-based identity verification for network members</li>
        <li>Subscription and access management</li>
        <li>Security incident response and fraud prevention</li>
      </ul>

      <SectionHeading>3. Data Sharing</SectionHeading>
      <BodyText>
        BLACKGRID does NOT sell, rent, or trade your personal data. Period.
        Limited sharing occurs only:
      </BodyText>
      <ul className="text-[#8A8A8A] text-xs leading-relaxed list-disc list-inside space-y-1 mt-2">
        <li>
          With vetted security service providers bound by strict confidentiality
          agreements
        </li>
        <li>
          When legally required by valid court order or law enforcement request
        </li>
        <li>
          With your explicit written consent for specific verified purposes
        </li>
      </ul>

      <SectionHeading>4. Data Retention & Deletion Rights</SectionHeading>
      <BodyText>
        You retain full control of your data. Session data is purged when you
        exit. Persistent profile data is retained only while your account
        remains active. You may request complete data deletion at any time by
        contacting acgagc7@gmail.com. Deletion requests are fulfilled within 30
        days. Upon account termination, all personal data is irreversibly purged
        from our systems.
      </BodyText>

      <SectionHeading>5. Security Measures</SectionHeading>
      <BodyText>
        All personal data is protected by end-to-end encryption using AES-256.
        Our zero-knowledge architecture ensures that even BLACKGRID
        administrators cannot access your private watchlist or identity data.
        All data in transit is encrypted via TLS 1.3. Regular third-party
        security audits are conducted to maintain compliance.
      </BodyText>

      <SectionHeading>6. Children's Privacy</SectionHeading>
      <BodyText>
        BLACKGRID is strictly for users 18 years of age and older. We do not
        knowingly collect data from minors. If you believe a minor has submitted
        information, contact us immediately.
      </BodyText>

      <SectionHeading>7. Changes to This Policy</SectionHeading>
      <BodyText>
        We may update this Privacy Policy as our services evolve. Material
        changes will be communicated via in-app notification. Continued use of
        BLACKGRID after changes constitutes acceptance of the updated policy.
      </BodyText>

      <SectionHeading>8. Contact</SectionHeading>
      <BodyText>
        For privacy inquiries, data requests, or concerns, contact:{" "}
        <a
          href="mailto:acgagc7@gmail.com"
          className="text-[#C9A95C] hover:underline"
        >
          acgagc7@gmail.com
        </a>
      </BodyText>
    </div>
  );
}

function TermsOfServiceContent() {
  return (
    <div className="space-y-1">
      <BodyText>
        Last updated: {CURRENT_YEAR}. Please read these Terms of Service
        carefully before accessing or using BLACKGRID.
      </BodyText>

      <SectionHeading>1. Acceptance of Terms</SectionHeading>
      <BodyText>
        By accessing or using BLACKGRID, you agree to be bound by these Terms of
        Service and our Privacy Policy. If you do not agree, you may not use the
        platform. These terms constitute a legally binding agreement between you
        and BLACKGRID.
      </BodyText>

      <SectionHeading>2. Eligibility</SectionHeading>
      <BodyText>
        You must be at least 18 years of age to use BLACKGRID. By using this
        platform, you represent that you are of legal age and have the authority
        to enter into this agreement. Access is limited to approved members who
        have completed the verification process.
      </BodyText>

      <SectionHeading>3. Subscription & Payment</SectionHeading>
      <BodyText>
        Access to BLACKGRID premium features requires a one-time access fee of
        $100.00 USD, payable via Stripe (all major credit cards) or Chime
        ($Alise-Grey). Payments are non-refundable once access has been granted.
        The Intelligence Feed is available at no charge. Admin approval is
        required after payment submission before full access is granted.
      </BodyText>

      <SectionHeading>4. Permitted Use</SectionHeading>
      <BodyText>
        BLACKGRID may be used solely for lawful personal safety and situational
        awareness purposes. You agree to use this platform only for your own
        protection and the protection of others in a lawful manner consistent
        with all applicable federal, state, and local laws.
      </BodyText>

      <SectionHeading>5. Prohibited Conduct</SectionHeading>
      <BodyText>You expressly agree NOT to:</BodyText>
      <ul className="text-[#8A8A8A] text-xs leading-relaxed list-disc list-inside space-y-1 mt-2">
        <li>
          Use BLACKGRID for illegal surveillance, stalking, or harassment of any
          individual
        </li>
        <li>
          Collect, compile, or distribute other users' personal information
          without consent
        </li>
        <li>
          Attempt to reverse-engineer, hack, or compromise the platform's
          security
        </li>
        <li>
          Share your account credentials or access with unauthorized individuals
        </li>
        <li>
          Use BLACKGRID for any commercial purpose without explicit written
          authorization
        </li>
        <li>
          Submit false identity information or impersonate another individual
        </li>
      </ul>

      <SectionHeading>6. Content & Data Ownership</SectionHeading>
      <BodyText>
        You retain full ownership of any data you input into BLACKGRID,
        including watchlist entries, profile information, and personal notes. By
        submitting content, you grant BLACKGRID a limited license to process and
        display your data solely to provide the services you've requested.
        BLACKGRID retains ownership of all proprietary algorithms, platform
        architecture, and aggregated anonymized data.
      </BodyText>

      <SectionHeading>7. Limitation of Liability</SectionHeading>
      <BodyText>
        BLACKGRID is provided "as is" and "as available" without warranties of
        any kind. BLACKGRID shall not be liable for any indirect, incidental,
        special, or consequential damages arising from your use of or inability
        to use the platform. Our maximum liability to you shall not exceed the
        amount you paid for access. BLACKGRID is an intelligence tool and does
        not guarantee personal safety outcomes.
      </BodyText>

      <SectionHeading>8. Termination</SectionHeading>
      <BodyText>
        BLACKGRID reserves the right to suspend or terminate your access at any
        time for violation of these terms, fraudulent activity, or conduct
        deemed harmful to other users or the platform. Termination does not
        entitle you to a refund of your access fee.
      </BodyText>

      <SectionHeading>9. Governing Law</SectionHeading>
      <BodyText>
        These Terms are governed by and construed in accordance with the laws of
        the State of California, without regard to conflict of law provisions.
        Any disputes shall be resolved in the courts of San Francisco County,
        California.
      </BodyText>

      <SectionHeading>10. Contact</SectionHeading>
      <BodyText>
        For questions regarding these Terms:{" "}
        <a
          href="mailto:acgagc7@gmail.com"
          className="text-[#C9A95C] hover:underline"
        >
          acgagc7@gmail.com
        </a>
      </BodyText>
    </div>
  );
}

function SecurityContent() {
  return (
    <div className="space-y-1">
      <BodyText>
        BLACKGRID was built from the ground up with security as its foundation.
        Every architectural decision prioritizes the protection of our members'
        identities and data.
      </BodyText>

      <SectionHeading>End-to-End Encryption</SectionHeading>
      <BodyText>
        All personal data — including identity badges, watchlist entries,
        location history, and private notes — is encrypted end-to-end using
        AES-256. Your data is encrypted on your device before transmission and
        can only be decrypted by you.
      </BodyText>

      <SectionHeading>Zero-Knowledge Architecture</SectionHeading>
      <BodyText>
        BLACKGRID operates on a zero-knowledge model: we cannot access your
        private data even if compelled. Your encrypted keys never leave your
        device. This means your watchlist, identity notes, and personal
        intelligence data are mathematically inaccessible to platform operators.
      </BodyText>

      <SectionHeading>Verified Identity System</SectionHeading>
      <BodyText>
        Identity verification is strictly opt-in. Members choose what to share,
        with whom, and when. Identity badges are generated locally and
        transmitted only via explicit user action (QR scan or NFC tap). No
        identity data is passively broadcast or stored on central servers
        without consent.
      </BodyText>

      <SectionHeading>Secure QR Badge Sharing</SectionHeading>
      <BodyText>
        QR identity badges use one-time cryptographic tokens that expire after
        each scan. This prevents unauthorized duplication or replay attacks.
        Each scan generates a new token, ensuring your identity cannot be reused
        without your initiation.
      </BodyText>

      <SectionHeading>No Unauthorized Data Collection</SectionHeading>
      <BodyText>
        BLACKGRID does not access your camera, microphone, contacts, or location
        without your explicit permission. All sensor access requires active,
        informed consent. You may revoke any permission at any time through your
        device settings.
      </BodyText>

      <SectionHeading>Authentication</SectionHeading>
      <BodyText>
        BLACKGRID uses Internet Identity — a cryptographic authentication system
        built on the Internet Computer Protocol — for all user authentication.
        This eliminates passwords, phishing vectors, and credential theft. Your
        identity is tied to a cryptographic key pair, not a username and
        password.
      </BodyText>

      <SectionHeading>Regular Security Audits</SectionHeading>
      <BodyText>
        BLACKGRID undergoes regular security assessments by independent
        third-party auditors. Critical vulnerabilities are patched within 24
        hours of discovery. Non-critical issues are remediated on a rolling
        30-day cycle.
      </BodyText>

      <SectionHeading>Incident Response Policy</SectionHeading>
      <BodyText>
        In the event of a security incident affecting member data, BLACKGRID
        will notify affected users within 72 hours of discovery, consistent with
        applicable breach notification laws. Our incident response team operates
        24/7 to contain, investigate, and remediate any security events.
      </BodyText>

      <SectionHeading>Report a Security Issue</SectionHeading>
      <BodyText>
        If you discover a security vulnerability in BLACKGRID, please report it
        responsibly to:{" "}
        <a
          href="mailto:acgagc7@gmail.com"
          className="text-[#C9A95C] hover:underline"
        >
          acgagc7@gmail.com
        </a>
        . We take all reports seriously and respond within 24 hours.
      </BodyText>
    </div>
  );
}

function ContactContent() {
  return (
    <div className="space-y-4">
      <div className="border border-[#2A2A2A] bg-[#121212] p-6 rounded">
        <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
          BLACKGRID
        </div>
        <div className="text-lg font-bold tracking-widest uppercase text-[#C9A95C] mb-1">
          Administrator
        </div>
        <div className="text-xs text-[#8A8A8A] tracking-wider">
          BLACK TIER · ELITE CLEARANCE
        </div>
      </div>

      <div className="border border-[#2A2A2A] bg-[#121212] p-6 rounded space-y-4">
        <div>
          <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
            Email
          </div>
          <a
            href="mailto:acgagc7@gmail.com"
            className="text-[#C9A95C] text-sm tracking-wider hover:underline"
            data-ocid="contact.link"
          >
            acgagc7@gmail.com
          </a>
        </div>
        <div>
          <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
            Response Time
          </div>
          <div className="text-[#B8B8B8] text-xs tracking-wider">
            Within 48 hours
          </div>
        </div>
      </div>

      <div className="border border-[#2A2A2A] bg-[#121212] p-6 rounded">
        <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-3">
          Contact For
        </div>
        <ul className="space-y-2">
          {[
            "Access requests & membership approval",
            "Technical support & platform issues",
            "Security vulnerability reports",
            "Billing & payment verification",
            "Privacy & data deletion requests",
            "Partnership & corporate inquiries",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-[#C9A95C] mt-1.5 flex-shrink-0" />
              <span className="text-[#8A8A8A] text-xs leading-relaxed">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <BodyText>
        All communications are handled with strict confidentiality. For urgent
        security matters, mark your subject line{" "}
        <span className="text-[#C9A95C]">[URGENT — BLACKGRID SECURITY]</span>{" "}
        for priority response.
      </BodyText>
    </div>
  );
}

function ShareUrlBar() {
  const [copied, setCopied] = useState(false);
  const url = window.location.href.split("?")[0].split("#")[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex items-center gap-0 max-w-lg mx-auto">
      <div className="flex-1 border border-[#2A2A2A] bg-[#0A0A0A] px-4 py-2.5 text-left overflow-hidden">
        <span className="text-[10px] tracking-wider text-[#8A8A8A] font-mono truncate block">
          {url}
        </span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        data-ocid="share.copy_button"
        className="px-4 py-2.5 border border-[#C9A95C] bg-[#C9A95C0A] text-[#C9A95C] text-[10px] tracking-widest uppercase font-bold hover:bg-[#C9A95C] hover:text-[#0A0A0A] transition-all whitespace-nowrap"
      >
        {copied ? "COPIED ✓" : "COPY LINK"}
      </button>
    </div>
  );
}

function AdminSetupContent({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);
  const configured = getSessionParameter("caffeineAdminToken");

  function handleSave() {
    if (!token.trim()) return;
    try {
      localStorage.setItem("caffeineAdminToken", token.trim());
    } catch {
      // ignore
    }
    storeSessionParameter("caffeineAdminToken", token.trim());
    setSaved(true);
    setToken("");
  }

  function handleClear() {
    localStorage.removeItem("caffeineAdminToken");
    sessionStorage.removeItem("caffeineAdminToken");
    setSaved(false);
    setToken("");
  }

  return (
    <div className="space-y-5">
      {/* Status */}
      <div className="flex items-center gap-2 border border-[#2A2A2A] bg-[#121212] px-4 py-3 rounded">
        <div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            configured
              ? "bg-[#2ECC71] animate-pulse"
              : "bg-[#7A0000] animate-pulse"
          }`}
        />
        <span className="text-xs tracking-wider text-[#B8B8B8]">
          {configured ? "Admin token is configured" : "No admin token set"}
        </span>
      </div>

      {/* Token input */}
      <div className="space-y-2">
        <label
          htmlFor="admin-token-input"
          className="text-[10px] tracking-widest uppercase text-[#8A8A8A]"
        >
          Admin Secret Token
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setSaved(false);
          }}
          placeholder="Paste your admin token here"
          id="admin-token-input"
          data-ocid="admin.input"
          className="w-full bg-[#121212] border border-[#2A2A2A] text-[#EDEDED] text-xs tracking-wider px-4 py-3 rounded outline-none focus:border-[#C9A95C] transition-colors placeholder-[#3A3A3A]"
        />
      </div>

      {/* Success message */}
      {saved && (
        <div
          className="flex items-center gap-2 border border-[#2ECC7133] bg-[#0A1A0A] px-4 py-3 rounded"
          data-ocid="admin.success_state"
        >
          <div className="w-2 h-2 rounded-full bg-[#2ECC71] flex-shrink-0" />
          <span className="text-xs tracking-wider text-[#2ECC71]">
            Token saved. Please click REQUEST ACCESS to log in.
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!token.trim()}
          data-ocid="admin.save_button"
          className="flex-1 py-2.5 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-widest uppercase font-bold hover:bg-[#E8C878] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          SAVE & CONTINUE
        </button>
        <button
          type="button"
          onClick={handleClear}
          data-ocid="admin.delete_button"
          className="px-5 py-2.5 border border-[#2A2A2A] text-[#8A8A8A] text-[10px] tracking-widest uppercase hover:border-[#7A0000] hover:text-[#FF4444] transition-colors"
        >
          CLEAR
        </button>
      </div>

      <BodyText>
        After saving your token, click CLOSE and then hit{" "}
        <span className="text-[#C9A95C]">REQUEST ACCESS</span> to authenticate
        with administrator privileges.
      </BodyText>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          data-ocid="admin.close_button"
          className="px-6 py-2 border border-[#2A2A2A] text-[#8A8A8A] text-[10px] tracking-widest uppercase hover:border-[#C9A95C] hover:text-[#C9A95C] transition-colors"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
}

const MODAL_CONFIG: Record<
  Exclude<ModalType, null | "adminSetup">,
  { title: string; subtitle: string; content: React.ReactNode }
> = {
  privacy: {
    title: "Privacy Policy",
    subtitle: "How BLACKGRID protects your data",
    content: <PrivacyPolicyContent />,
  },
  terms: {
    title: "Terms of Service",
    subtitle: "Rules governing your use of BLACKGRID",
    content: <TermsOfServiceContent />,
  },
  security: {
    title: "Security",
    subtitle: "Our commitment to protecting your identity",
    content: <SecurityContent />,
  },
  contact: {
    title: "Contact",
    subtitle: "Reach the BLACKGRID administrator",
    content: <ContactContent />,
  },
};

const FOOTER_LINKS: {
  label: string;
  modal: Exclude<ModalType, null | "adminSetup">;
}[] = [
  { label: "Privacy Policy", modal: "privacy" },
  { label: "Terms of Service", modal: "terms" },
  { label: "Security", modal: "security" },
  { label: "Contact", modal: "contact" },
];

export default function LandingPage({
  onLogin,
  onTabChange,
}: LandingPageProps) {
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const activeModal =
    openModal && openModal !== "adminSetup" ? MODAL_CONFIG[openModal] : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] grid-bg">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#C9A95C33] bg-[#C9A95C0A] rounded mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
            <span className="text-[10px] tracking-widest uppercase text-[#C9A95C]">
              System Online — San Francisco Grid Active
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-widest uppercase text-[#EDEDED] leading-none mb-6">
            ELITE INTEL.
            <br />
            <span className="text-[#C9A95C]">COMPLETE</span>
            <br />
            SECURITY.
          </h1>

          <p className="text-sm md:text-base tracking-wider text-[#B8B8B8] max-w-xl mx-auto mb-10 leading-relaxed">
            The personal intelligence system for those who refuse to move
            through the world blind. Real-time threat mapping. Verified
            identity. AI-powered awareness.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              type="button"
              onClick={onLogin}
              data-ocid="hero.primary_button"
              className="px-8 py-3 bg-[#C9A95C] text-[#0A0A0A] text-xs tracking-widest uppercase font-bold hover:bg-[#E8C878] transition-all gold-glow animate-ring-pulse"
            >
              REQUEST ACCESS
            </button>
            <button
              type="button"
              onClick={() => onTabChange?.("intelligence")}
              data-ocid="hero.explore_button"
              className="px-8 py-3 border border-[#2A2A2A] text-[#B8B8B8] text-xs tracking-widest uppercase hover:border-[#C9A95C] hover:text-[#C9A95C] transition-all"
            >
              VIEW CAPABILITIES
            </button>
            <button
              type="button"
              onClick={() => setShowTutorial(true)}
              data-ocid="hero.secondary_button"
              className="px-8 py-3 border border-[#C9A95C] text-[#C9A95C] text-xs tracking-widest uppercase hover:bg-[#C9A95C0A] transition-all"
            >
              HOW IT WORKS
            </button>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => onTabChange?.("registry")}
              data-ocid="hero.registry.button"
              className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#2ECC71] text-[#2ECC71] text-[10px] tracking-widest uppercase font-bold hover:bg-[#2ECC7115] transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse inline-block" />
              VIEW SEX OFFENDER REGISTRY — FREE · NO ACCOUNT REQUIRED
            </button>
          </div>
        </motion.div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#C9A95C]" />
          <span className="text-[9px] tracking-widest uppercase text-[#8A8A8A]">
            SCROLL
          </span>
        </div>
      </section>

      {/* Live Map */}
      <section className="px-6 md:px-12 lg:px-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <LiveMap />
        </motion.div>
      </section>

      {/* KPI Row */}
      <section className="px-6 md:px-12 lg:px-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <KPIRow onTabChange={onTabChange} />
        </motion.div>
      </section>

      {/* Alert Ticker */}
      <section className="px-6 md:px-12 lg:px-24 pb-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <AlertTicker />
        </motion.div>
      </section>

      {/* Features / Capabilities */}
      <section className="px-6 md:px-12 lg:px-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="mb-10">
            <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] mb-3">
              CAPABILITIES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-wider uppercase text-[#EDEDED]">
              See Everything That Matters
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                onClick={() => onTabChange?.(feat.tab)}
                className="card-blackgrid hover:border-[#C9A95C44] hover:bg-[#151505] transition-all cursor-pointer flex flex-col"
                data-ocid={`capabilities.item.${i + 1}`}
              >
                <feat.icon className="w-6 h-6 text-[#C9A95C] mb-4" />
                <h3 className="text-sm font-bold tracking-wider uppercase text-[#EDEDED] mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#8A8A8A] leading-relaxed flex-1">
                  {feat.desc}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTabChange?.(feat.tab);
                  }}
                  data-ocid={`capabilities.access_button.${i + 1}`}
                  className="mt-4 w-full py-2 text-[9px] tracking-widest uppercase font-bold border border-[#C9A95C33] text-[#C9A95C] hover:bg-[#C9A95C] hover:text-[#0A0A0A] transition-all"
                >
                  ACCESS →
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing */}
      <section
        className="px-6 md:px-12 lg:px-24 pb-20"
        data-ocid="pricing.section"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="mb-10">
            <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] mb-3">
              INTELLIGENCE TIERS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-wider uppercase text-[#EDEDED]">
              Control The Unknown
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                data-ocid={`pricing.${plan.tier.toLowerCase().replace(" ", "-")}.card`}
                className={`relative flex flex-col p-6 rounded border ${
                  plan.style === "gold"
                    ? "border-[#C9A95C] bg-[#0F0E00] gold-glow"
                    : plan.style === "black"
                      ? "border-[#2A2A2A] bg-[#0A0A0A]"
                      : "border-[#2A2A2A] bg-[#121212]"
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[9px] tracking-widest uppercase font-bold rounded ${
                      plan.style === "gold"
                        ? "bg-[#C9A95C] text-[#0A0A0A]"
                        : "bg-[#2A2A2A] text-[#8A8A8A]"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}
                <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-2">
                  {plan.tier}
                </div>
                <div className="flex items-end gap-1 mb-1">
                  <span
                    className={`text-4xl font-bold ${plan.style === "gold" ? "text-[#C9A95C]" : "text-[#EDEDED]"}`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-xs text-[#8A8A8A] mb-1">
                    {plan.period}
                  </span>
                </div>
                <div className="text-xs text-[#8A8A8A] mb-6">{plan.desc}</div>
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <Check
                        className={`w-3 h-3 flex-shrink-0 ${plan.style === "gold" ? "text-[#C9A95C]" : "text-[#2ECC71]"}`}
                      />
                      <span className="text-xs text-[#B8B8B8] tracking-wide">
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    if (plan.tier === "FREE") {
                      onTabChange?.(plan.targetTab);
                    } else {
                      onTabChange?.(plan.targetTab);
                    }
                  }}
                  data-ocid={`pricing.${plan.tier.toLowerCase().replace(" ", "-")}.primary_button`}
                  className={`w-full py-2.5 text-[10px] tracking-widest uppercase font-bold transition-all ${
                    plan.style === "gold"
                      ? "bg-[#C9A95C] text-[#0A0A0A] hover:bg-[#E8C878]"
                      : plan.style === "black"
                        ? "border border-[#2A2A2A] text-[#8A8A8A] hover:border-[#C9A95C] hover:text-[#C9A95C]"
                        : "border border-[#2A2A2A] text-[#B8B8B8] hover:border-[#EDEDED] hover:text-[#EDEDED]"
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA / Share Section */}
      <section className="px-6 md:px-12 lg:px-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border border-[#C9A95C33] bg-[#0D0D00] p-10 md:p-16 text-center max-w-4xl mx-auto"
        >
          <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] mb-4">
            NOW AVAILABLE · SAN FRANCISCO
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-wider uppercase text-[#EDEDED] mb-4 leading-tight">
            See Everything
            <br />
            <span className="text-[#C9A95C]">That Matters.</span>
          </h2>
          <p className="text-sm text-[#8A8A8A] tracking-wider max-w-xl mx-auto mb-8 leading-relaxed">
            BLACKGRID is the luxury intelligence platform for those who refuse
            to move through the world blind. Available in San Francisco.
            Expanding nationwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button
              type="button"
              onClick={() => onTabChange?.("subscription")}
              data-ocid="cta.primary_button"
              className="px-10 py-4 bg-[#C9A95C] text-[#0A0A0A] text-xs tracking-widest uppercase font-bold hover:bg-[#E8C878] transition-all gold-glow"
            >
              REQUEST ACCESS — $100
            </button>
            <button
              type="button"
              onClick={() => onTabChange?.("guards")}
              data-ocid="cta.secondary_button"
              className="px-10 py-4 border border-[#2A2A2A] text-[#8A8A8A] text-xs tracking-widest uppercase hover:border-[#C9A95C] hover:text-[#C9A95C] transition-all"
            >
              BLACK TIER INQUIRY — $300+
            </button>
          </div>
          <ShareUrlBar />
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] px-6 md:px-12 lg:px-24 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span
                className="text-lg font-bold uppercase text-[#C9A95C]"
                style={{ letterSpacing: "0.25em" }}
              >
                BLACKGRID
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] tracking-wider">
              Intelligent Security for the Elite.
            </p>
          </div>
          <div className="flex flex-wrap gap-8">
            {FOOTER_LINKS.map(({ label, modal }) => (
              <button
                key={modal}
                type="button"
                onClick={() => setOpenModal(modal)}
                data-ocid={`footer.${modal}.button`}
                className="text-[10px] tracking-widest uppercase text-[#8A8A8A] hover:text-[#C9A95C] transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                {label}
              </button>
            ))}
            {/* Admin token setup — subtle, no special styling */}
            <button
              type="button"
              onClick={() => setOpenModal("adminSetup")}
              data-ocid="footer.admin.button"
              className="text-[10px] tracking-widest uppercase text-[#8A8A8A] hover:text-[#C9A95C] transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              ADMIN
            </button>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#1A1A1A] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-wider text-[#8A8A8A]">
            © {new Date().getFullYear()} BLACKGRID. All rights reserved.
          </p>
          <p className="text-[10px] tracking-wider text-[#8A8A8A]">
            Built with ❤ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#C9A95C] hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {showTutorial && (
        <TutorialOverlay onClose={() => setShowTutorial(false)} />
      )}

      {/* Legal / Info Modals */}
      <Dialog
        open={openModal !== null && openModal !== "adminSetup"}
        onOpenChange={(open) => !open && setOpenModal(null)}
      >
        <DialogContent
          className="bg-[#0A0A0A] border border-[#2A2A2A] text-[#B8B8B8] max-w-2xl w-full p-0 gap-0"
          data-ocid="footer.modal"
        >
          {activeModal && (
            <>
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#1A1A1A]">
                <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
                  BLACKGRID LEGAL
                </div>
                <DialogTitle className="text-[#C9A95C] uppercase tracking-widest text-lg font-bold">
                  {activeModal.title}
                </DialogTitle>
                <p className="text-[#8A8A8A] text-xs tracking-wider mt-1">
                  {activeModal.subtitle}
                </p>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] px-6 py-5">
                {activeModal.content}
              </ScrollArea>
              <div className="px-6 py-4 border-t border-[#1A1A1A] flex justify-end">
                <button
                  type="button"
                  onClick={() => setOpenModal(null)}
                  data-ocid="footer.modal.close_button"
                  className="px-6 py-2 border border-[#2A2A2A] text-[#8A8A8A] text-[10px] tracking-widest uppercase hover:border-[#C9A95C] hover:text-[#C9A95C] transition-colors"
                >
                  CLOSE
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Token Setup Modal */}
      <Dialog
        open={openModal === "adminSetup"}
        onOpenChange={(open) => !open && setOpenModal(null)}
      >
        <DialogContent
          className="bg-[#0A0A0A] border border-[#2A2A2A] text-[#B8B8B8] max-w-md w-full p-0 gap-0"
          data-ocid="admin.dialog"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#1A1A1A]">
            <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
              BLACKGRID SYSTEM
            </div>
            <DialogTitle className="text-[#C9A95C] uppercase tracking-widest text-lg font-bold">
              Admin Token Setup
            </DialogTitle>
            <p className="text-[#8A8A8A] text-xs tracking-wider mt-1">
              Configure your administrator access token
            </p>
          </DialogHeader>
          <div className="px-6 py-5">
            <AdminSetupContent onClose={() => setOpenModal(null)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
