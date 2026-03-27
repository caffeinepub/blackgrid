import { Check, Eye, Navigation, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import AlertTicker from "./AlertTicker";
import KPIRow from "./KPIRow";
import LiveMap from "./LiveMap";

interface LandingPageProps {
  onLogin: () => void;
  onTabChange?: (tab: string) => void;
}

const FEATURES = [
  {
    icon: Shield,
    title: "AI Threat Detection",
    desc: "Real-time behavior analysis and pattern recognition identify risks before they escalate.",
  },
  {
    icon: Eye,
    title: "Identity Intelligence",
    desc: "Consent-based verified identity scanning. Know who matters, instantly.",
  },
  {
    icon: Navigation,
    title: "Route Defense",
    desc: "Dynamic safe-route generation avoids high-risk zones and recent incident areas.",
  },
  {
    icon: Zap,
    title: "Live Threat Grid",
    desc: "SFPD public feeds, user network signals, and environmental data fused in real-time.",
  },
];

const PRICING = [
  {
    tier: "FREE",
    price: "$0",
    period: "/ month",
    desc: "Basic situational awareness",
    features: [
      "Basic map alerts",
      "Limited scan (3/day)",
      "Public incident feed",
    ],
    cta: "GET STARTED",
    style: "default",
  },
  {
    tier: "ELITE",
    price: "$79",
    period: "/ month",
    desc: "Full AI-powered protection",
    features: [
      "Unlimited AI detection",
      "Watchlist system",
      "Route defense mode",
      "Priority alerts",
      "Identity scan",
    ],
    cta: "ACTIVATE ELITE",
    style: "gold",
    badge: "MOST POPULAR",
  },
  {
    tier: "BLACK",
    price: "$500+",
    period: "/ month",
    desc: "Concierge-level security",
    features: [
      "Live human analysts",
      "Emergency override",
      "Private security integration",
      "Stealth vibration alerts",
      "All Elite features",
    ],
    cta: "REQUEST INVITE",
    style: "black",
    badge: "INVITE ONLY",
  },
];

const FOOTER_LINKS = [
  "Privacy Policy",
  "Terms of Service",
  "Security",
  "Contact",
];

export default function LandingPage({
  onLogin,
  onTabChange,
}: LandingPageProps) {
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
              className="px-8 py-3 border border-[#2A2A2A] text-[#B8B8B8] text-xs tracking-widest uppercase hover:border-[#C9A95C] hover:text-[#C9A95C] transition-all"
            >
              VIEW CAPABILITIES
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

      {/* Features */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card-blackgrid hover:border-[#C9A95C44] hover:bg-[#151505] transition-all"
              >
                <feat.icon className="w-6 h-6 text-[#C9A95C] mb-4" />
                <h3 className="text-sm font-bold tracking-wider uppercase text-[#EDEDED] mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#8A8A8A] leading-relaxed">
                  {feat.desc}
                </p>
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
                data-ocid={`pricing.${plan.tier.toLowerCase()}.card`}
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
                  onClick={onLogin}
                  data-ocid={`pricing.${plan.tier.toLowerCase()}.primary_button`}
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

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] px-6 md:px-12 lg:px-24 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/assets/generated/blackgrid-logo-transparent.dim_200x200.png"
                alt="BLACKGRID"
                className="w-8 h-8"
              />
              <span className="text-lg font-bold tracking-widest uppercase text-[#C9A95C]">
                BLACKGRID
              </span>
            </div>
            <p className="text-xs text-[#8A8A8A] tracking-wider">
              Intelligent Security for the Elite.
            </p>
          </div>
          <div className="flex flex-wrap gap-8">
            {FOOTER_LINKS.map((link) => (
              <span
                key={link}
                className="text-[10px] tracking-widest uppercase text-[#8A8A8A] cursor-default"
              >
                {link}
              </span>
            ))}
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
    </div>
  );
}
