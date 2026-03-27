import { XCircle } from "lucide-react";
import { motion } from "motion/react";

export default function PaymentFailure() {
  const goToSubscription = () => {
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
        data-ocid="payment_failure.panel"
      >
        <div className="mb-8 flex justify-center">
          <div
            className="w-20 h-20 border border-[#C00000] flex items-center justify-center"
            style={{ boxShadow: "0 0 40px rgba(192,0,0,0.2)" }}
          >
            <XCircle className="w-10 h-10 text-[#C00000]" />
          </div>
        </div>

        <p className="text-[10px] tracking-[0.3em] uppercase text-[#C00000] mb-3">
          TRANSACTION FAILED
        </p>
        <h1 className="text-3xl font-bold tracking-widest uppercase text-[#EDEDED] mb-4">
          PAYMENT FAILED
        </h1>
        <p className="text-[#8A8A8A] text-sm mb-2">
          Transaction could not be completed.
        </p>
        <p className="text-[#5A5A5A] text-xs tracking-wide mb-10">
          Your card was not charged. Please verify your payment details and try
          again.
        </p>

        <button
          type="button"
          data-ocid="payment_failure.primary_button"
          onClick={goToSubscription}
          className="px-8 py-3 border border-[#C9A95C] text-[#C9A95C] text-[10px] tracking-widest uppercase font-bold hover:bg-[#C9A95C] hover:text-[#0A0A0A] transition-all"
        >
          TRY AGAIN
        </button>

        <div className="mt-12 pt-6 border-t border-[#1A1A1A]">
          <p className="text-[9px] text-[#3A3A3A] tracking-wide">
            © {new Date().getFullYear()} BLACKGRID · SECURE PAYMENTS
          </p>
        </div>
      </motion.div>
    </div>
  );
}
