import { Check, CreditCard, Loader2, Shield, Star, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useCreateCheckoutSession } from "../hooks/useCreateCheckoutSession";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsCallerApproved } from "../hooks/useQueries";

const ALL_FEATURES = [
  "Unlimited threat scanning",
  "Full AI Threat Detection",
  "Advanced proximity intel",
  "Private watchlist (unlimited)",
  "Route defense mode",
  "Priority incident alerts",
  "Live Threat Grid Map",
  "Security Score Gauge",
  "Identity Scan (QR & NFC)",
  "24/7 live analyst support",
  "Concierge security integration",
  "Private security network access",
  "Discreet alert protocols",
  "Dedicated security coordinator",
];

function PaymentBadges() {
  return (
    <div className="mt-3 mb-1">
      <p className="text-[8px] tracking-[0.3em] uppercase text-[#6A6A6A] mb-2">
        ACCEPTED PAYMENTS
      </p>
      <div className="flex flex-wrap gap-1.5">
        <span
          className="px-2 py-1 text-[8px] font-bold tracking-widest uppercase"
          style={{ backgroundColor: "#1A1F71", color: "#fff" }}
        >
          VISA
        </span>
        <span
          className="px-2 py-1 text-[8px] font-bold tracking-widest uppercase"
          style={{ backgroundColor: "#CC2200", color: "#fff" }}
        >
          MASTERCARD
        </span>
        <span
          className="px-2 py-1 text-[8px] font-bold tracking-widest uppercase"
          style={{ backgroundColor: "#007BC1", color: "#fff" }}
        >
          AMEX
        </span>
        <span
          className="px-2 py-1 text-[8px] font-bold tracking-widest uppercase"
          style={{ backgroundColor: "#2A2A2A", color: "#C9A95C" }}
        >
          DEBIT
        </span>
        <span
          className="px-2 py-1 text-[8px] font-bold tracking-widest uppercase"
          style={{ backgroundColor: "#003087", color: "#fff" }}
        >
          PAYPAL
        </span>
      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { data: isApproved, isLoading: checkingApproval } =
    useIsCallerApproved();
  const [requested, setRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { mutateAsync: createCheckoutSession, isPending: cardPending } =
    useCreateCheckoutSession();

  const principalId = identity?.getPrincipal().toText() ?? "";

  const handleRequest = async () => {
    if (!actor) return;
    setSubmitting(true);
    try {
      await actor.requestApproval();
      setRequested(true);
      toast.success("Access request submitted. Admin will verify within 24h.");
    } catch {
      toast.error("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardPayment = async () => {
    try {
      const session = await createCheckoutSession([
        {
          productName: "BLACKGRID Elite Membership",
          productDescription:
            "Full access to all BLACKGRID features — Dashboard, Shield, Registry, Watchlist, Intelligence, Profile, Network",
          currency: "usd",
          priceInCents: BigInt(10000),
          quantity: BigInt(1),
        },
      ]);
      window.location.href = session.url;
    } catch {
      toast.error("Card payment unavailable. Try Chime or contact admin.");
    }
  };

  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <p className="text-[10px] tracking-[0.3em] uppercase text-[#C9A95C] mb-2">
          MEMBERSHIP TIER
        </p>
        <h1 className="text-3xl font-bold tracking-widest uppercase text-[#EDEDED]">
          ELITE ACCESS
        </h1>
        <p className="mt-3 text-sm text-[#8A8A8A] max-w-md mx-auto uppercase tracking-wide">
          Black Tie Members Only. Exclusive Intelligence Network.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div
          data-ocid="subscription.elite.card"
          className="relative border border-[#C9A95C] bg-[#111111] p-8 flex flex-col"
          style={{ boxShadow: "0 0 40px rgba(201,169,92,0.1)" }}
        >
          {/* Badge */}
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#C9A95C] text-[#0A0A0A] text-[8px] tracking-widest uppercase font-bold">
            BLACK TIE ONLY
          </div>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 border border-[#C9A95C] flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#C9A95C]" />
              </div>
              <div className="w-9 h-9 border border-[#C9A95C]/60 flex items-center justify-center">
                <Star className="w-5 h-5 text-[#C9A95C]/60" />
              </div>
              <div className="w-9 h-9 border border-[#C9A95C]/40 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#C9A95C]/40" />
              </div>
            </div>
            <div>
              <div className="text-[9px] tracking-widest uppercase text-[#C9A95C] mb-0.5">
                BLACKGRID · ELITE
              </div>
              <div className="text-2xl font-bold tracking-widest text-[#EDEDED]">
                ELITE MEMBERSHIP
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-3xl font-bold text-[#C9A95C]">$100.00</div>
              <div className="text-[10px] tracking-widest text-[#8A8A8A] uppercase">
                /month
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="w-full h-px mb-6"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(201,169,92,0.4), transparent)",
            }}
          />

          {/* Features grid */}
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 mb-8">
            {ALL_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center gap-3 py-1.5">
                <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-[#C9A95C]">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs tracking-wide text-[#EDEDED]">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            className="w-full h-px mb-6"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(201,169,92,0.2), transparent)",
            }}
          />

          {/* Payment / Status section */}
          {checkingApproval ? (
            <div className="flex items-center gap-2 py-4">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A95C] animate-pulse" />
              <span className="text-[9px] tracking-widest uppercase text-[#8A8A8A]">
                Checking access status...
              </span>
            </div>
          ) : isApproved ? (
            /* Already approved */
            <div
              data-ocid="subscription.active.success_state"
              className="flex items-center gap-3 p-4 bg-[#0D2A0D] border border-[#2ECC71]/30"
            >
              <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#2ECC71]">
                  ACTIVE · ELITE MEMBER
                </p>
                <p className="text-[9px] tracking-wide uppercase text-[#2ECC71]/60 mt-0.5">
                  Full intelligence access granted
                </p>
              </div>
            </div>
          ) : requested ? (
            /* Request submitted */
            <div
              data-ocid="subscription.pending.success_state"
              className="p-4 border border-[#C9A95C]/30 bg-[#0A0A0A]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C9A95C] animate-pulse" />
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#C9A95C]">
                  ACCESS REQUESTED — AWAITING VERIFICATION
                </p>
              </div>
              <p className="text-[9px] tracking-wide uppercase text-[#6A6A6A]">
                Admin will verify your payment within 24 hours.
              </p>
            </div>
          ) : (
            /* Payment instructions */
            <div data-ocid="subscription.payment.panel">
              {/* Chime section */}
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#C9A95C] mb-4 flex items-center gap-2">
                <CreditCard className="w-3 h-3" />
                CHIME PAYMENT INSTRUCTIONS
              </p>

              <div className="space-y-3 mb-5">
                {[
                  {
                    step: "01",
                    title: "SEND $100.00/MONTH VIA CHIME",
                    sub: "Chime tag: $Alise-Grey  ·  acgagc7@gmail.com",
                  },
                  {
                    step: "02",
                    title: "INCLUDE YOUR IDENTITY ID IN NOTE",
                    sub: principalId
                      ? `${principalId.slice(0, 28)}...`
                      : "Your principal ID (shown on login screen)",
                    mono: true,
                  },
                  {
                    step: "03",
                    title: "CLICK REQUEST ACCESS BELOW",
                    sub: "Admin verifies payment and grants access within 24h",
                  },
                ].map(({ step, title, sub, mono }) => (
                  <div key={step} className="flex gap-4 items-start">
                    <span className="text-[10px] font-bold font-mono text-[#C9A95C] mt-0.5 flex-shrink-0">
                      {step}
                    </span>
                    <div className="border-l border-[#2A2A2A] pl-3">
                      <p className="text-[9px] tracking-widest uppercase text-[#EDEDED]">
                        {title}
                      </p>
                      <p
                        className={`text-[8px] mt-0.5 ${
                          mono
                            ? "font-mono text-[#C9A95C]/80"
                            : "text-[#6A6A6A] tracking-wide"
                        }`}
                      >
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4 p-3 border border-[#C9A95C]/20 bg-[#0A0A0A] flex items-center justify-between">
                <span className="text-[8px] tracking-widest uppercase text-[#6A6A6A]">
                  CHIME TAG
                </span>
                <span className="text-base font-bold font-mono text-[#C9A95C]">
                  $Alise-Grey
                </span>
              </div>

              <button
                type="button"
                data-ocid="subscription.request.primary_button"
                onClick={handleRequest}
                disabled={submitting}
                className="w-full py-3.5 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#E8C878] transition-all disabled:opacity-50"
              >
                {submitting ? "SUBMITTING..." : "REQUEST ACCESS"}
              </button>

              {/* OR divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="h-px flex-1 bg-[#2A2A2A]" />
                <span className="text-[9px] tracking-[0.3em] uppercase text-[#4A4A4A]">
                  OR
                </span>
                <div className="h-px flex-1 bg-[#2A2A2A]" />
              </div>

              {/* Card / PayPal section */}
              <div className="border border-[#C9A95C]/15 bg-[#0D0D0D] p-4">
                <p className="text-[9px] tracking-[0.3em] uppercase text-[#C9A95C] mb-3 flex items-center gap-2">
                  <CreditCard className="w-3 h-3" />
                  PAY BY CARD OR PAYPAL
                </p>
                <button
                  type="button"
                  data-ocid="subscription.card.primary_button"
                  onClick={handleCardPayment}
                  disabled={cardPending}
                  className="w-full py-3.5 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#E8C878] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-1"
                >
                  {cardPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      PREPARING CHECKOUT...
                    </>
                  ) : (
                    "PAY $100.00 — CARD OR PAYPAL"
                  )}
                </button>
                <PaymentBadges />
              </div>
            </div>
          )}
        </div>

        {/* Info bar */}
        <p className="text-center text-[8px] tracking-widest uppercase text-[#4A4A4A] mt-4">
          Active members enjoy full intelligence access · Members only network
        </p>
      </div>
    </div>
  );
}
