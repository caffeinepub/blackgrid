import { Loader2, LogOut, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function PaymentGate() {
  const { actor } = useActor();
  const { identity, clear } = useInternetIdentity();
  const [requested, setRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const principalId = identity?.getPrincipal().toText() ?? "";

  const handleRequest = async () => {
    if (!actor) return;
    setSubmitting(true);
    try {
      await actor.requestApproval();
      setRequested(true);
      toast.success("Access request submitted.");
    } catch {
      toast.error("Failed to submit request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,169,92,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,92,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <img
            src="/assets/generated/blackgrid-logo-transparent.dim_200x200.png"
            alt="BLACKGRID"
            className="w-9 h-9 object-contain"
          />
          <span className="text-lg font-bold tracking-[0.3em] uppercase text-[#C9A95C]">
            BLACKGRID
          </span>
        </div>

        {!requested ? (
          <div
            className="border border-[#C9A95C]/40 bg-[#111111] p-8"
            style={{ boxShadow: "0 0 60px rgba(201,169,92,0.08)" }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-8 bg-[#C9A95C]" />
              <div>
                <p className="text-[8px] tracking-[0.4em] uppercase text-[#8A8A8A]">
                  RESTRICTED
                </p>
                <h1 className="text-xl font-bold tracking-widest uppercase text-[#EDEDED]">
                  ELITE ACCESS REQUIRED
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6 mt-4">
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(201,169,92,0.5), transparent)",
                }}
              />
              <Shield className="w-3.5 h-3.5 text-[#C9A95C]/60" />
            </div>

            <p className="text-xs text-[#8A8A8A] tracking-wide leading-relaxed mb-8 uppercase">
              BLACKGRID IS AN EXCLUSIVE BLACK TIE MEMBERSHIP. ACCESS IS
              RESTRICTED TO VERIFIED ELITE MEMBERS ONLY. COMPLETE PAYMENT TO
              REQUEST ACCESS.
            </p>

            {/* Payment Steps */}
            <div className="space-y-4 mb-8">
              <p className="text-[9px] tracking-[0.3em] uppercase text-[#C9A95C] mb-3">
                PAYMENT INSTRUCTIONS
              </p>

              {[
                {
                  step: "01",
                  text: "Send $99/month via Chime",
                  detail: "Chime: $Alise-Grey  ·  acgagc7@gmail.com",
                },
                {
                  step: "02",
                  text: "Include your Identity ID in the Chime note",
                  detail: principalId
                    ? `${principalId.slice(0, 28)}...`
                    : "Your principal ID",
                  mono: true,
                },
                {
                  step: "03",
                  text: "Click Request Access below",
                  detail: "Admin will verify and grant access within 24 hours",
                },
              ].map(({ step, text, detail, mono }) => (
                <div key={step} className="flex gap-4">
                  <span className="text-[10px] font-bold text-[#C9A95C] mt-0.5 flex-shrink-0 font-mono">
                    {step}
                  </span>
                  <div className="border-l border-[#2A2A2A] pl-4 pb-2">
                    <p className="text-[10px] tracking-widest uppercase text-[#EDEDED] mb-1">
                      {text}
                    </p>
                    <p
                      className={`text-[9px] ${
                        mono
                          ? "font-mono text-[#C9A95C] break-all"
                          : "text-[#6A6A6A] tracking-wide"
                      }`}
                    >
                      {detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chime tag highlight */}
            <div className="mb-6 p-3 border border-[#C9A95C]/20 bg-[#0A0A0A] flex items-center justify-between">
              <span className="text-[9px] tracking-widest uppercase text-[#8A8A8A]">
                CHIME TAG
              </span>
              <span className="text-sm font-bold font-mono text-[#C9A95C]">
                $Alise-Grey
              </span>
            </div>

            {/* Request button */}
            <button
              type="button"
              data-ocid="payment_gate.request.primary_button"
              onClick={handleRequest}
              disabled={submitting}
              className="w-full py-3.5 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#E8C878] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                "REQUEST ACCESS"
              )}
            </button>

            <button
              type="button"
              data-ocid="payment_gate.logout.button"
              onClick={clear}
              className="w-full mt-3 py-2 flex items-center justify-center gap-1.5 text-[8px] tracking-widest uppercase text-[#4A4A4A] hover:text-[#CC3333] transition-colors"
            >
              <LogOut className="w-3 h-3" />
              LOGOUT
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="border border-[#C9A95C]/40 bg-[#111111] p-8 text-center"
            style={{ boxShadow: "0 0 60px rgba(201,169,92,0.1)" }}
            data-ocid="payment_gate.pending.panel"
          >
            <div className="w-12 h-12 border border-[#C9A95C] flex items-center justify-center mx-auto mb-6">
              <Shield className="w-6 h-6 text-[#C9A95C]" />
            </div>

            <p className="text-[8px] tracking-[0.4em] uppercase text-[#C9A95C] mb-2">
              SUBMITTED
            </p>
            <h2 className="text-lg font-bold tracking-widest uppercase text-[#EDEDED] mb-4">
              ACCESS REQUESTED
            </h2>
            <p className="text-[10px] tracking-[0.15em] uppercase text-[#C9A95C] mb-6">
              AWAITING ADMIN VERIFICATION
            </p>

            <div className="p-3 bg-[#0A0A0A] border border-[#2A2A2A] mb-2">
              <p className="text-[8px] tracking-widest uppercase text-[#6A6A6A] mb-1">
                YOUR IDENTITY ID
              </p>
              <code className="text-[10px] font-mono text-[#C9A95C] break-all leading-relaxed">
                {principalId}
              </code>
            </div>

            <p className="text-[9px] tracking-wide text-[#6A6A6A] uppercase leading-relaxed mt-4">
              Admin will verify your Chime payment and grant access within 24
              hours.
            </p>

            <div className="flex items-center justify-center gap-2 mt-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A95C] animate-pulse" />
              <span className="text-[8px] tracking-widest uppercase text-[#8A8A8A]">
                VERIFICATION IN PROGRESS
              </span>
            </div>

            <button
              type="button"
              data-ocid="payment_gate.pending_logout.button"
              onClick={clear}
              className="w-full mt-6 py-2 flex items-center justify-center gap-1.5 text-[8px] tracking-widest uppercase text-[#4A4A4A] hover:text-[#CC3333] transition-colors"
            >
              <LogOut className="w-3 h-3" />
              LOGOUT
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
