import { Download, QrCode, Shield } from "lucide-react";
import { useRef } from "react";

const ADMIN_NAME = "ADMINISTRATOR";
const ADMIN_EMAIL = "acgagc7@gmail.com";
const ADMIN_TIER = "BLACK TIER · ELITE";
const ADMIN_ROLE = "BLACKGRID ADMIN";

// QR code encodes a vCard / identity payload for networking scans
const QR_DATA = encodeURIComponent(
  `BEGIN:VCARD\nVERSION:3.0\nFN:BLACKGRID ADMINISTRATOR\nTITLE:${ADMIN_ROLE}\nEMAIL:${ADMIN_EMAIL}\nNOTE:BLACKGRID ${ADMIN_TIER}\nEND:VCARD`,
);
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=C9A95C&bgcolor=0A0A0A&data=${QR_DATA}&format=png&qzone=2`;

export default function AdminIdentityBadge() {
  const badgeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4">
      <div className="text-[10px] tracking-widest uppercase text-[#C9A95C] border-b border-[#1A1A1A] pb-3 flex items-center gap-2">
        <QrCode className="w-3.5 h-3.5" />
        ADMIN IDENTITY BADGE
      </div>

      {/* Badge Card */}
      <div
        ref={badgeRef}
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #0F0F0F 0%, #0A0A0A 60%, #111008 100%)",
          border: "1px solid rgba(201,169,92,0.4)",
          boxShadow:
            "0 0 30px rgba(201,169,92,0.08), inset 0 0 60px rgba(201,169,92,0.02)",
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#C9A95C]/60" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#C9A95C]/60" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-[#C9A95C]/60" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#C9A95C]/60" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #C9A95C 0px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #C9A95C 0px, transparent 1px, transparent 20px)",
          }}
        />

        <div className="relative p-6 flex flex-col sm:flex-row gap-6 items-center">
          {/* QR Code */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div
              className="p-2"
              style={{
                border: "1px solid rgba(201,169,92,0.3)",
                background: "rgba(0,0,0,0.6)",
              }}
            >
              <img
                src={QR_URL}
                alt="BLACKGRID Admin QR Code"
                width={160}
                height={160}
                className="block"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <div className="text-[7px] tracking-[0.3em] uppercase text-[#C9A95C]/60 text-center">
              SCAN TO CONNECT
            </div>
          </div>

          {/* Identity Info */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* BLACKGRID logo text */}
            <div
              className="text-2xl font-black tracking-[0.4em] uppercase"
              style={{ color: "#C9A95C", letterSpacing: "0.4em" }}
            >
              BLACKGRID
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-[8px] tracking-[0.3em] uppercase text-[#8A8A8A] mb-0.5">
                  OPERATIVE
                </div>
                <div className="text-xl font-bold tracking-[0.2em] uppercase text-[#EDEDED]">
                  {ADMIN_NAME}
                </div>
              </div>

              <div>
                <div className="text-[8px] tracking-[0.3em] uppercase text-[#8A8A8A] mb-0.5">
                  ROLE
                </div>
                <div className="text-sm font-bold tracking-[0.15em] uppercase text-[#C9A95C]">
                  {ADMIN_ROLE}
                </div>
              </div>

              <div>
                <div className="text-[8px] tracking-[0.3em] uppercase text-[#8A8A8A] mb-0.5">
                  CLEARANCE
                </div>
                <div
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-[8px] tracking-[0.25em] uppercase font-bold"
                  style={{
                    color: "#C9A95C",
                    border: "1px solid rgba(201,169,92,0.4)",
                    background: "rgba(201,169,92,0.08)",
                  }}
                >
                  <Shield className="w-2.5 h-2.5" />
                  {ADMIN_TIER}
                </div>
              </div>

              <div>
                <div className="text-[8px] tracking-[0.3em] uppercase text-[#8A8A8A] mb-0.5">
                  CONTACT
                </div>
                <div className="text-xs tracking-wider text-[#EDEDED]/80">
                  {ADMIN_EMAIL}
                </div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1A1A1A]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] animate-pulse" />
              <span className="text-[8px] tracking-[0.3em] uppercase text-[#2ECC71]">
                IDENTITY ACTIVE · VERIFIED
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[9px] tracking-wider text-[#3A3A3A] text-center">
        Share this badge or have contacts scan the QR code to connect with you
        on BLACKGRID.
      </p>
    </div>
  );
}
