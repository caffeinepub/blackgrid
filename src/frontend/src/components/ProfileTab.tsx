import { Loader2, Shield, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Variant_free_elite_black,
  Variant_personal_business_flagged,
  Variant_verified_none_elite_basic,
} from "../backend.d";
import { useProfile, useSaveProfile } from "../hooks/useQueries";

const TIER_LABELS: Record<Variant_free_elite_black, string> = {
  [Variant_free_elite_black.free]: "FREE MEMBER",
  [Variant_free_elite_black.elite]: "ELITE OPERATIVE",
  [Variant_free_elite_black.black]: "BLACK TIER",
};

const VERIFICATION_LABELS: Record<Variant_verified_none_elite_basic, string> = {
  [Variant_verified_none_elite_basic.none]: "UNVERIFIED",
  [Variant_verified_none_elite_basic.basic]: "BASIC VERIFIED",
  [Variant_verified_none_elite_basic.verified]: "VERIFIED",
  [Variant_verified_none_elite_basic.elite]: "ELITE VERIFIED",
};

export default function ProfileTab() {
  const { data: profile, isLoading } = useProfile();
  const saveProfile = useSaveProfile();

  const [name, setName] = useState("");
  const [badge, setBadge] = useState<Variant_personal_business_flagged>(
    Variant_personal_business_flagged.personal,
  );

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setBadge(
        profile.profileBadge ?? Variant_personal_business_flagged.personal,
      );
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    try {
      await saveProfile.mutateAsync({
        ...profile,
        name,
        profileBadge: badge,
      });
      toast.success("PROFILE UPDATED");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between pb-4 border-b border-[#1A1A1A]">
        <div>
          <div className="text-[10px] tracking-widest uppercase text-[#8A8A8A] mb-1">
            IDENTITY MANAGEMENT
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase text-[#EDEDED]">
            My Profile
          </h1>
          <p className="text-xs text-[#8A8A8A] mt-1 tracking-wide">
            Manage your BLACKGRID operative identity
          </p>
        </div>
        <div
          className="w-14 h-14 border border-[#C9A95C]/40 flex items-center justify-center"
          style={{ background: "rgba(201,169,92,0.06)" }}
        >
          <User className="w-6 h-6 text-[#C9A95C]" />
        </div>
      </div>

      {isLoading ? (
        <div
          className="card-blackgrid text-center py-12"
          data-ocid="profile.loading_state"
        >
          <div className="text-[#C9A95C] text-xs tracking-widest uppercase animate-pulse">
            LOADING PROFILE...
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Edit Panel */}
          <div className="card-blackgrid space-y-6">
            <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] border-b border-[#1A1A1A] pb-3">
              OPERATIVE DETAILS
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="profile-name"
                className="block text-[9px] tracking-[0.3em] uppercase text-[#8A8A8A]"
              >
                OPERATIVE NAME
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-ocid="profile.input"
                placeholder="Enter your name"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-4 py-2.5 text-sm text-[#EDEDED] tracking-wider uppercase placeholder:text-[#3A3A3A] outline-none transition-all focus:border-[#C9A95C]"
              />
            </div>

            {/* Badge Type */}
            <div className="space-y-2">
              <label
                htmlFor="profile-badge"
                className="block text-[9px] tracking-[0.3em] uppercase text-[#8A8A8A]"
              >
                BADGE TYPE
              </label>
              <select
                id="profile-badge"
                value={badge}
                onChange={(e) =>
                  setBadge(e.target.value as Variant_personal_business_flagged)
                }
                data-ocid="profile.select"
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] px-4 py-2.5 text-sm text-[#EDEDED] tracking-widest uppercase outline-none transition-all focus:border-[#C9A95C] appearance-none cursor-pointer"
              >
                <option value={Variant_personal_business_flagged.personal}>
                  PERSONAL
                </option>
                <option value={Variant_personal_business_flagged.business}>
                  BUSINESS
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saveProfile.isPending || !profile}
              data-ocid="profile.save_button"
              className="w-full py-3 bg-[#C9A95C] text-[#0A0A0A] text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-[#E8C878] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  SAVING...
                </>
              ) : (
                "SAVE PROFILE"
              )}
            </button>
          </div>

          {/* Status Panel */}
          <div className="space-y-4">
            <div className="card-blackgrid space-y-4">
              <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] border-b border-[#1A1A1A] pb-3">
                OPERATIVE STATUS
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] tracking-widest uppercase text-[#8A8A8A]">
                    SUBSCRIPTION TIER
                  </span>
                  <span
                    className="text-[9px] tracking-widest uppercase font-bold px-2 py-1 border"
                    style={{
                      color: "#C9A95C",
                      borderColor: "rgba(201,169,92,0.3)",
                      background: "rgba(201,169,92,0.06)",
                    }}
                  >
                    {profile
                      ? (TIER_LABELS[profile.subscriptionTier] ?? "—")
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[9px] tracking-widest uppercase text-[#8A8A8A]">
                    VERIFICATION
                  </span>
                  <span
                    className="text-[9px] tracking-widest uppercase font-bold px-2 py-1 border"
                    style={{
                      color: "#2ECC71",
                      borderColor: "rgba(46,204,113,0.3)",
                      background: "rgba(46,204,113,0.06)",
                    }}
                  >
                    {profile
                      ? (VERIFICATION_LABELS[profile.verificationLevel] ?? "—")
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Score */}
            <div className="card-blackgrid">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-4 h-4 text-[#C9A95C]" />
                <span className="text-[10px] tracking-widest uppercase text-[#C9A95C]">
                  TRUST SCORE
                </span>
              </div>
              <div className="text-4xl font-bold text-[#C9A95C] mb-2">
                {profile ? Number(profile.trustScore) : 0}
              </div>
              <div className="w-full h-1 bg-[#1A1A1A] rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${Math.min(Number(profile?.trustScore ?? 0), 100)}%`,
                    background: "linear-gradient(90deg, #C9A95C, #E8C878)",
                  }}
                />
              </div>
              <div className="text-[8px] tracking-widest uppercase text-[#8A8A8A] mt-2">
                OPERATIVE RELIABILITY INDEX
              </div>
            </div>

            {/* Shield Status */}
            <div
              className="card-blackgrid flex items-center gap-4"
              style={{
                borderColor: "rgba(46,204,113,0.2)",
                background: "rgba(46,204,113,0.03)",
              }}
            >
              <Shield className="w-8 h-8 text-[#2ECC71]" />
              <div>
                <div className="text-[9px] tracking-widest uppercase text-[#2ECC71] font-bold">
                  IDENTITY ACTIVE
                </div>
                <div className="text-[8px] tracking-wide text-[#8A8A8A] mt-0.5">
                  Encrypted — Consent-Protected
                </div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
