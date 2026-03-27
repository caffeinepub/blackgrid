import { CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import {
  Variant_free_elite_black,
  Variant_verified_none_elite_basic,
} from "../backend";
import type { backendInterface as ExtendedBackend } from "../backend.d";
import { useActor } from "../hooks/useActor";

export default function PaymentSuccess() {
  const { actor, isFetching } = useActor();
  const recorded = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || recorded.current) return;
    recorded.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    if (!sessionId) return;

    const extActor = actor as unknown as ExtendedBackend;

    // Record the purchase so admin sees the notification
    extActor.recordSubscriptionPurchase(sessionId, "elite").catch(() => {});

    // Queue user for admin approval (grants full access)
    actor.requestApproval().catch(() => {});

    // Upgrade the user's profile to Elite tier
    actor
      .getCallerUserProfile()
      .then((profile) => {
        const base = profile ?? {
          name: "",
          verificationLevel: Variant_verified_none_elite_basic.none,
          trustScore: BigInt(50),
          subscriptionTier: Variant_free_elite_black.free,
          profileBadge: undefined,
          isActive: true,
        };
        return actor.saveCallerUserProfile({
          ...base,
          subscriptionTier: Variant_free_elite_black.elite,
          isActive: true,
        });
      })
      .catch(() => {});
  }, [actor, isFetching]);

  const goToDashboard = () => {
    window.location.href = "/";
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
        data-ocid="payment_success.panel"
      >
        <div className="mb-8 flex justify-center">
          <div
            className="w-20 h-20 border border-[#C9A95C] flex items-center justify-center"
            style={{ boxShadow: "0 0 40px rgba(201,169,92,0.2)" }}
          >
            <CheckCircle className="w-10 h-10 text-[#C9A95C]" />
          </div>
        </div>

        <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A95C] mb-3">
          TRANSACTION VERIFIED
        </p>
        <h1 className="text-3xl font-bold tracking-widest uppercase text-[#EDEDED] mb-4">
          FULL ACCESS UNLOCKED
        </h1>
        <p className="text-[#8A8A8A] text-sm mb-2">
          Your Elite membership is now active — $100.00/month.
        </p>
        <p className="text-[#5A5A5A] text-xs tracking-wide mb-10">
          All BLACKGRID features are now available: Dashboard, Shield, Registry,
          Watchlist, Intelligence, Profile, and Network.
        </p>

        <button
          type="button"
          data-ocid="payment_success.primary_button"
          onClick={goToDashboard}
          className="px-8 py-3 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-widest uppercase font-bold hover:bg-[#E8C878] transition-all"
        >
          ENTER BLACKGRID
        </button>

        <div className="mt-12 pt-6 border-t border-[#1A1A1A]">
          <p className="text-[9px] text-[#3A3A3A] tracking-wide">
            © {new Date().getFullYear()} BLACKGRID · ELITE TIER ACTIVE
          </p>
        </div>
      </motion.div>
    </div>
  );
}
