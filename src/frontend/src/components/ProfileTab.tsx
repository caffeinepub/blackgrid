import { Loader2, QrCode, Shield, Star, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Variant_free_elite_black,
  Variant_personal_business_flagged,
  Variant_verified_none_elite_basic,
} from "../backend.d";
import { useProfile, useSaveProfile } from "../hooks/useQueries";
import { useQRScanner } from "../qr-code/useQRScanner";
import AdminIdentityBadge from "./AdminIdentityBadge";

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

function QRScannerSection() {
  const {
    qrResults,
    isScanning,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    clearResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 150,
    maxResults: 10,
  });

  if (isSupported === false) {
    return (
      <div
        className="card-blackgrid text-center py-8"
        data-ocid="profile.qr_scanner.panel"
        style={{ border: "1px solid rgba(201,169,92,0.2)" }}
      >
        <QrCode className="w-8 h-8 text-[#C9A95C]/40 mx-auto mb-3" />
        <p className="text-[10px] tracking-widest uppercase text-[#4A4A4A]">
          Camera not supported on this device
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="profile.qr_scanner.panel">
      <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] border-b border-[#1A1A1A] pb-3 flex items-center gap-2">
        <QrCode className="w-3.5 h-3.5" />
        QR IDENTITY SCANNER
      </div>

      {/* Video preview */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "#050505",
          border: "1px solid rgba(201,169,92,0.15)",
          display: isScanning ? "block" : "none",
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: "100%",
            maxHeight: "300px",
            display: "block",
            objectFit: "cover",
          }}
          playsInline
          muted
        />
        {/* Scan overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C9A95C]/80" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#C9A95C]/80" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#C9A95C]/80" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#C9A95C]/80" />
          <div
            className="absolute left-0 right-0 h-px animate-pulse"
            style={{
              top: "50%",
              background:
                "linear-gradient(90deg, transparent, #C9A95C, transparent)",
            }}
          />
        </div>
        <div className="absolute bottom-2 left-0 right-0 flex justify-center">
          <span className="text-[8px] tracking-[0.3em] uppercase text-[#C9A95C]/80 bg-black/60 px-3 py-1">
            {isScanning ? "SCANNING..." : "INITIALIZING"}
          </span>
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Error */}
      {error && (
        <div
          className="px-4 py-3 text-[9px] tracking-wider uppercase"
          style={{
            background: "rgba(122,0,0,0.15)",
            border: "1px solid rgba(122,0,0,0.4)",
            color: "#E07070",
          }}
          data-ocid="profile.qr_scanner.error_state"
        >
          {error.message}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isScanning ? (
          <button
            type="button"
            onClick={startScanning}
            disabled={!canStartScanning || isLoading}
            data-ocid="profile.qr_scanner.primary_button"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C9A95C] text-[#0A0A0A] text-[9px] tracking-[0.3em] uppercase font-bold hover:bg-[#E8C878] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <QrCode className="w-3 h-3" />
            )}
            {isLoading ? "INITIALIZING" : "START SCANNING"}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScanning}
            disabled={isLoading}
            data-ocid="profile.qr_scanner.secondary_button"
            className="flex items-center gap-2 px-5 py-2.5 text-[9px] tracking-[0.3em] uppercase font-bold transition-all"
            style={{
              border: "1px solid rgba(201,169,92,0.4)",
              color: "#C9A95C",
              background: "rgba(201,169,92,0.06)",
            }}
          >
            <X className="w-3 h-3" />
            STOP SCANNING
          </button>
        )}
        {qrResults.length > 0 && (
          <button
            type="button"
            onClick={clearResults}
            data-ocid="profile.qr_scanner.delete_button"
            className="px-4 py-2.5 text-[9px] tracking-[0.3em] uppercase text-[#8A8A8A] hover:text-[#CC3333] transition-all"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Results */}
      {qrResults.length > 0 && (
        <div className="space-y-2" data-ocid="profile.qr_scanner.list">
          <div className="text-[8px] tracking-[0.3em] uppercase text-[#8A8A8A]">
            SCAN RESULTS — {qrResults.length} DETECTED
          </div>
          {qrResults.map((result, idx) => (
            <div
              key={result.timestamp}
              data-ocid={`profile.qr_scanner.item.${idx + 1}`}
              style={{
                background: "rgba(201,169,92,0.04)",
                border: "1px solid rgba(201,169,92,0.15)",
              }}
              className="px-4 py-3 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[7px] tracking-[0.3em] uppercase font-bold px-1.5 py-0.5"
                  style={{
                    color: "#C9A95C",
                    background: "rgba(201,169,92,0.1)",
                  }}
                >
                  QR DECODED
                </span>
                <span className="text-[8px] text-[#4A4A4A] tracking-wider">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-[#EDEDED]/80 tracking-wide break-all font-mono">
                {result.data}
              </p>
            </div>
          ))}
        </div>
      )}

      {!isScanning && qrResults.length === 0 && (
        <div
          className="text-center py-6"
          data-ocid="profile.qr_scanner.empty_state"
        >
          <p className="text-[9px] tracking-widest uppercase text-[#3A3A3A]">
            Tap START SCANNING to read a BLACKGRID identity QR code
          </p>
        </div>
      )}
    </div>
  );
}

export default function ProfileTab({ isAdmin }: { isAdmin?: boolean }) {
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
      {/* Admin banner */}
      {isAdmin && (
        <div
          className="flex items-center gap-3 px-5 py-3"
          style={{
            background:
              "linear-gradient(90deg, rgba(201,169,92,0.12), rgba(201,169,92,0.04))",
            border: "1px solid rgba(201,169,92,0.5)",
            boxShadow: "0 0 20px rgba(201,169,92,0.08)",
          }}
          data-ocid="profile.admin.panel"
        >
          <div className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse flex-shrink-0" />
          <span
            className="text-[10px] font-bold tracking-[0.35em] uppercase"
            style={{ color: "#C9A95C" }}
          >
            ADMINISTRATOR — FULL ACCESS GRANTED
          </span>
          <div
            className="ml-auto text-[8px] tracking-[0.2em] uppercase px-2 py-0.5 font-bold"
            style={{
              color: "#0A0A0A",
              background: "#C9A95C",
            }}
          >
            BLACK TIER · ELITE
          </div>
        </div>
      )}

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

      {/* Admin identity badge */}
      {isAdmin && (
        <div className="card-blackgrid">
          <AdminIdentityBadge />
        </div>
      )}

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

      {/* QR Scanner — available to all paid users */}
      <div className="card-blackgrid">
        <QRScannerSection />
      </div>
    </div>
  );
}
