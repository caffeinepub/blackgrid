import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export default function EmergencyServices() {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLocating(true);
    setLocError(false);
    setCoords(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocError(true);
        setLocating(false);
      },
      { timeout: 8000 },
    );
  }, [isOpen]);

  return (
    <>
      {/* Floating SOS Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        data-ocid="sos.primary_button"
        className="fixed right-6 bottom-20 md:bottom-6 z-[9998] w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-xs tracking-widest shadow-lg animate-pulse hover:animate-none hover:scale-110 transition-transform"
        style={{
          backgroundColor: "#CC0000",
          boxShadow: "0 0 20px rgba(204,0,0,0.6), 0 0 40px rgba(204,0,0,0.3)",
        }}
        aria-label="Open emergency services panel"
      >
        SOS
      </button>

      {/* Emergency Panel Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
            style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsOpen(false);
            }}
            data-ocid="sos.modal"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm"
              style={{
                backgroundColor: "#0A0A0A",
                border: "1px solid rgba(201,169,92,0.55)",
                boxShadow:
                  "0 0 60px rgba(204,0,0,0.2), 0 0 30px rgba(201,169,92,0.1)",
              }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                data-ocid="sos.close_button"
                className="absolute top-4 right-4 text-[#6A6A6A] hover:text-[#C9A95C] transition-colors text-lg leading-none z-10"
                aria-label="Close emergency panel"
              >
                ✕
              </button>

              <div className="p-6 pb-5">
                {/* Header */}
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: "#CC0000" }}
                    />
                    <p className="text-[9px] tracking-[0.45em] uppercase text-[#6A6A6A]">
                      BLACKGRID
                    </p>
                  </div>
                  <h2
                    className="text-lg font-bold uppercase text-[#C9A95C]"
                    style={{ letterSpacing: "0.2em" }}
                  >
                    EMERGENCY SERVICES
                  </h2>
                  <p
                    className="text-[10px] tracking-[0.3em] uppercase mt-1"
                    style={{ color: "rgba(201,169,92,0.55)" }}
                  >
                    TAP TO CONNECT
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 mb-5">
                  {/* CALL 911 */}
                  <a
                    href="tel:911"
                    data-ocid="sos.call_911.primary_button"
                    className="flex items-center gap-4 w-full p-4 text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: "#8B0000" }}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-2xl flex-shrink-0">🚨</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold tracking-widest uppercase">
                        CALL 911
                      </p>
                      <p
                        className="text-[10px] tracking-wider mt-0.5"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        Police · Fire · Medical
                      </p>
                    </div>
                    <span className="text-white opacity-60 text-lg">▶</span>
                  </a>

                  {/* SF Non-Emergency */}
                  <a
                    href="tel:4155530123"
                    data-ocid="sos.sf_nonemergency.button"
                    className="flex items-center gap-4 w-full p-4 transition-all hover:bg-[#1A1A1A]"
                    style={{
                      border: "1px solid rgba(201,169,92,0.3)",
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-2xl flex-shrink-0">📞</span>
                    <div className="flex-1 text-left">
                      <p
                        className="text-sm font-bold tracking-widest uppercase"
                        style={{ color: "#C9A95C" }}
                      >
                        SF NON-EMERGENCY
                      </p>
                      <p className="text-[10px] tracking-wider text-[#6A6A6A] mt-0.5">
                        415-553-0123
                      </p>
                    </div>
                    <span className="text-[#C9A95C] opacity-60 text-lg">▶</span>
                  </a>

                  {/* Crisis Text Line */}
                  <a
                    href="sms:741741?body=HOME"
                    data-ocid="sos.crisis_text.button"
                    className="flex items-center gap-4 w-full p-4 transition-all hover:bg-[#1A1A1A]"
                    style={{
                      border: "1px solid rgba(201,169,92,0.3)",
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-2xl flex-shrink-0">💬</span>
                    <div className="flex-1 text-left">
                      <p
                        className="text-sm font-bold tracking-widest uppercase"
                        style={{ color: "#C9A95C" }}
                      >
                        CRISIS TEXT LINE
                      </p>
                      <p className="text-[10px] tracking-wider text-[#6A6A6A] mt-0.5">
                        Text HOME to 741741
                      </p>
                    </div>
                    <span className="text-[#C9A95C] opacity-60 text-lg">▶</span>
                  </a>

                  {/* Contact Admin */}
                  <a
                    href="mailto:acgagc7@gmail.com?subject=EMERGENCY - BLACKGRID Security Request"
                    data-ocid="sos.contact_admin.button"
                    className="flex items-center gap-4 w-full p-4 transition-all hover:bg-[#1A1A1A]"
                    style={{
                      border: "1px solid rgba(201,169,92,0.3)",
                    }}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="text-2xl flex-shrink-0">📧</span>
                    <div className="flex-1 text-left">
                      <p
                        className="text-sm font-bold tracking-widest uppercase"
                        style={{ color: "#C9A95C" }}
                      >
                        CONTACT ADMIN
                      </p>
                      <p className="text-[10px] tracking-wider text-[#6A6A6A] mt-0.5">
                        BLACKGRID Security
                      </p>
                    </div>
                    <span className="text-[#C9A95C] opacity-60 text-lg">▶</span>
                  </a>
                </div>

                {/* GPS Section */}
                <div
                  className="mb-4 p-3"
                  style={{
                    backgroundColor: "rgba(201,169,92,0.05)",
                    border: "1px solid rgba(201,169,92,0.15)",
                  }}
                >
                  <p className="text-[9px] tracking-[0.35em] uppercase text-[#6A6A6A] mb-1.5">
                    YOUR LOCATION
                  </p>
                  {locating && (
                    <p className="text-[#C9A95C] text-xs tracking-widest animate-pulse">
                      Locating...
                    </p>
                  )}
                  {!locating && locError && (
                    <p className="text-[#6A6A6A] text-xs tracking-widest">
                      Location unavailable
                    </p>
                  )}
                  {!locating && coords && (
                    <p
                      className="text-[#C9A95C] text-xs"
                      style={{ fontFamily: "monospace" }}
                    >
                      {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                    </p>
                  )}
                  <p className="text-[9px] text-[#4A4A4A] mt-1.5 tracking-wide">
                    Provide these coordinates to emergency services
                  </p>
                </div>

                {/* Legal Disclaimer */}
                <p className="text-[9px] leading-relaxed text-[#4A4A4A] tracking-wide">
                  This app does not replace 911. In life-threatening
                  emergencies, always call 911 directly. BLACKGRID provides
                  supplemental safety tools only.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
