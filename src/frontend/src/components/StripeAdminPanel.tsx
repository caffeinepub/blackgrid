import { Loader2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

export default function StripeAdminPanel() {
  const { actor, isFetching } = useActor();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [allowedCountries, setAllowedCountries] = useState("US,GB,CA,AU");
  const secretKeyId = useId();
  const countriesId = useId();

  useEffect(() => {
    if (!actor || isFetching) return;
    const checkStatus = async () => {
      try {
        const [admin, configured] = await Promise.all([
          actor.isCallerAdmin(),
          actor.isStripeConfigured(),
        ]);
        setIsAdmin(admin);
        setIsConfigured(configured);
      } catch {
        // Not admin or error, hide panel
      } finally {
        setChecking(false);
      }
    };
    checkStatus();
  }, [actor, isFetching]);

  if (checking || !isAdmin) return null;

  const handleSave = async () => {
    if (!actor) return;
    if (!secretKey.trim()) {
      toast.error("Secret key is required.");
      return;
    }
    setSaving(true);
    try {
      const countries = allowedCountries
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      await actor.setStripeConfiguration({
        secretKey: secretKey.trim(),
        allowedCountries: countries,
      });
      setIsConfigured(true);
      toast.success("Stripe configuration saved.");
    } catch {
      toast.error("Failed to save Stripe configuration.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-ocid="stripe_admin.panel"
      className="mt-8 border border-[#2A2A2A] bg-[#111111] p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-[#C9A95C]" />
        <div>
          <p className="text-[9px] tracking-widest uppercase text-[#8A8A8A]">
            ADMIN
          </p>
          <h3 className="text-sm font-bold tracking-widest uppercase text-[#EDEDED]">
            STRIPE CONFIGURATION
          </h3>
        </div>
      </div>

      {isConfigured ? (
        <div
          className="flex items-center gap-3"
          data-ocid="stripe_admin.success_state"
        >
          <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
          <span className="text-xs tracking-wide text-[#2ECC71] uppercase">
            Stripe is configured and active
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor={secretKeyId}
              className="block text-[9px] tracking-widest uppercase text-[#8A8A8A] mb-2"
            >
              STRIPE SECRET KEY
            </label>
            <input
              id={secretKeyId}
              type="password"
              data-ocid="stripe_admin.input"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="sk_live_..."
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#EDEDED] text-xs px-3 py-2.5 focus:outline-none focus:border-[#C9A95C] transition-colors font-mono"
            />
          </div>
          <div>
            <label
              htmlFor={countriesId}
              className="block text-[9px] tracking-widest uppercase text-[#8A8A8A] mb-2"
            >
              ALLOWED COUNTRIES (comma-separated)
            </label>
            <input
              id={countriesId}
              type="text"
              data-ocid="stripe_admin.textarea"
              value={allowedCountries}
              onChange={(e) => setAllowedCountries(e.target.value)}
              placeholder="US,GB,CA"
              className="w-full bg-[#0A0A0A] border border-[#2A2A2A] text-[#EDEDED] text-xs px-3 py-2.5 focus:outline-none focus:border-[#C9A95C] transition-colors"
            />
          </div>
          <button
            type="button"
            data-ocid="stripe_admin.save_button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-widest uppercase font-bold hover:bg-[#E8C878] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                SAVING...
              </>
            ) : (
              "SAVE CONFIGURATION"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
