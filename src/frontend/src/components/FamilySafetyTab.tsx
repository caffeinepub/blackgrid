import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const TIPS = [
  {
    id: "tip-run",
    emoji: "🏃",
    text: "If you feel unsafe, go to a crowded place",
  },
  { id: "tip-charge", emoji: "📱", text: "Always keep your phone charged" },
  {
    id: "tip-adult",
    emoji: "🗣️",
    text: "Tell a trusted adult if something feels wrong",
  },
  { id: "tip-address", emoji: "🔢", text: "Know your home address by heart" },
  { id: "tip-friend", emoji: "👫", text: "Always walk with a friend" },
];

const BORDER_COLORS = ["#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#3B82F6"];

const DOTS = [
  { id: "dot-1", x: 5, y: 10, color: "#F59E0B", size: 18 },
  { id: "dot-2", x: 92, y: 6, color: "#EC4899", size: 14 },
  { id: "dot-3", x: 50, y: 3, color: "#8B5CF6", size: 10 },
  { id: "dot-4", x: 80, y: 20, color: "#10B981", size: 20 },
  { id: "dot-5", x: 15, y: 30, color: "#3B82F6", size: 12 },
  { id: "dot-6", x: 95, y: 55, color: "#F59E0B", size: 16 },
  { id: "dot-7", x: 3, y: 70, color: "#EC4899", size: 10 },
  { id: "dot-8", x: 88, y: 80, color: "#10B981", size: 14 },
  { id: "dot-9", x: 45, y: 92, color: "#8B5CF6", size: 12 },
];

function FloatingDot({
  x,
  y,
  color,
  size,
}: { x: number; y: number; color: string; size: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        opacity: 0.35,
        pointerEvents: "none",
      }}
    />
  );
}

export default function FamilySafetyTab() {
  const [parentPhone, setParentPhone] = useState(
    () => localStorage.getItem("bg_parent_phone") ?? "",
  );
  const [phoneInput, setPhoneInput] = useState(
    () => localStorage.getItem("bg_parent_phone") ?? "",
  );
  const [phoneSaved, setPhoneSaved] = useState(
    () => !!localStorage.getItem("bg_parent_phone"),
  );
  const [safeMsg, setSafeMsg] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [zoneAddress, setZoneAddress] = useState("");
  const [safeZones, setSafeZones] = useState<
    { id: string; name: string; address: string }[]
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("bg_safe_zones") ?? "[]");
    } catch {
      return [];
    }
  });
  const [callConfirm, setCallConfirm] = useState<null | {
    label: string;
    href: string;
  }>(null);

  useEffect(() => {
    localStorage.setItem("bg_safe_zones", JSON.stringify(safeZones));
  }, [safeZones]);

  const savePhone = () => {
    if (!phoneInput.trim()) return;
    localStorage.setItem("bg_parent_phone", phoneInput.trim());
    setParentPhone(phoneInput.trim());
    setPhoneSaved(true);
  };

  const handleCheckIn = () => {
    if (!parentPhone) {
      setSafeMsg("⚠️ Please save a parent phone number first!");
      setTimeout(() => setSafeMsg(""), 3000);
      return;
    }
    const sendSms = (lat?: number, lng?: number) => {
      const body =
        lat && lng
          ? `I'm safe! 📍 My location: https://maps.google.com/?q=${lat},${lng} — Sent from BLACKGRID Family Safety`
          : `I'm safe! 🌟 — Sent from BLACKGRID Family Safety`;
      window.location.href = `sms:${parentPhone}?body=${encodeURIComponent(body)}`;
      setSafeMsg("🎉 Message sent to parent!");
      setTimeout(() => setSafeMsg(""), 4000);
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendSms(pos.coords.latitude, pos.coords.longitude),
        () => sendSms(),
        { timeout: 5000 },
      );
    } else {
      sendSms();
    }
  };

  const handleCallParent = () => {
    if (!parentPhone) {
      setSafeMsg("⚠️ Please save a parent phone number first!");
      setTimeout(() => setSafeMsg(""), 3000);
      return;
    }
    setCallConfirm({
      label: `Call ${parentPhone}`,
      href: `tel:${parentPhone}`,
    });
  };

  const handle911 = () => {
    setCallConfirm({ label: "Call 911", href: "tel:911" });
  };

  const addZone = () => {
    if (!zoneName.trim() || !zoneAddress.trim()) return;
    if (safeZones.length >= 5) return;
    setSafeZones((prev) => [
      ...prev,
      {
        id: `zone-${Date.now()}`,
        name: zoneName.trim(),
        address: zoneAddress.trim(),
      },
    ]);
    setZoneName("");
    setZoneAddress("");
  };

  const removeZone = (id: string) => {
    setSafeZones((prev) => prev.filter((z) => z.id !== id));
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "#FFF9F0" }}
      data-ocid="family.panel"
    >
      {/* Decorative dots */}
      {DOTS.map((d) => (
        <FloatingDot key={d.id} x={d.x} y={d.y} color={d.color} size={d.size} />
      ))}

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1
            className="text-3xl md:text-4xl font-black mb-2"
            style={{
              background:
                "linear-gradient(135deg, #F59E0B 0%, #EC4899 40%, #8B5CF6 70%, #3B82F6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              lineHeight: 1.2,
            }}
          >
            👨‍👩‍👧 FAMILY SAFETY ZONE 🛡️
          </h1>
          <p className="text-base font-semibold" style={{ color: "#7C6F5B" }}>
            Keep your family safe &amp; connected
          </p>
        </motion.div>

        {/* Parent Phone Setup */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: "#FEF9C3", border: "3px solid #F59E0B" }}
          data-ocid="family.card"
        >
          <h2 className="text-lg font-black mb-3" style={{ color: "#92400E" }}>
            📞 Parent Phone Setup
          </h2>
          <div className="flex gap-2">
            <input
              type="tel"
              value={phoneInput}
              onChange={(e) => {
                setPhoneInput(e.target.value);
                setPhoneSaved(false);
              }}
              placeholder="Parent's Phone Number"
              data-ocid="family.input"
              className="flex-1 rounded-xl px-4 py-2.5 font-semibold outline-none text-sm"
              style={{
                border: "2px solid #F59E0B",
                backgroundColor: "white",
                color: "#44403C",
              }}
            />
            <button
              type="button"
              onClick={savePhone}
              data-ocid="family.save_button"
              className="rounded-xl px-5 py-2.5 font-black text-sm transition-transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
                color: "white",
              }}
            >
              SAVE
            </button>
          </div>
          <AnimatePresence>
            {phoneSaved && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mt-2 text-sm font-bold"
                style={{ color: "#065F46" }}
                data-ocid="family.success_state"
              >
                ✅ Parent connected!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Feedback message */}
        <AnimatePresence>
          {safeMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="rounded-2xl px-5 py-3 text-center font-black text-base"
              style={{
                backgroundColor: "#D1FAE5",
                border: "2px solid #10B981",
                color: "#065F46",
              }}
              data-ocid="family.toast"
            >
              {safeMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Check-In Button */}
        <motion.button
          type="button"
          onClick={handleCheckIn}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl py-5 font-black text-xl text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            border: "3px solid #059669",
          }}
          data-ocid="family.primary_button"
        >
          I'M SAFE! ✅
        </motion.button>

        {/* Call Parent Button */}
        <motion.button
          type="button"
          onClick={handleCallParent}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl py-5 font-black text-xl text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            border: "3px solid #D97706",
          }}
          data-ocid="family.secondary_button"
        >
          📞 CALL PARENT
        </motion.button>

        {/* Call 911 Button */}
        <motion.button
          type="button"
          onClick={handle911}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-2xl py-4 font-black text-lg text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
            border: "3px solid #DC2626",
          }}
          data-ocid="family.delete_button"
        >
          🚨 CALL 911
        </motion.button>

        {/* Safe Zones */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: "#EDE9FE", border: "3px solid #8B5CF6" }}
        >
          <h2 className="text-lg font-black mb-4" style={{ color: "#4C1D95" }}>
            🏠 Safe Zones
          </h2>
          {safeZones.length < 5 && (
            <div className="space-y-2 mb-4">
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="Zone name (e.g. Home, School)"
                data-ocid="family.search_input"
                className="w-full rounded-xl px-4 py-2.5 font-semibold outline-none text-sm"
                style={{
                  border: "2px solid #8B5CF6",
                  backgroundColor: "white",
                  color: "#2D1B69",
                }}
              />
              <input
                type="text"
                value={zoneAddress}
                onChange={(e) => setZoneAddress(e.target.value)}
                placeholder="Address"
                data-ocid="family.textarea"
                className="w-full rounded-xl px-4 py-2.5 font-semibold outline-none text-sm"
                style={{
                  border: "2px solid #8B5CF6",
                  backgroundColor: "white",
                  color: "#2D1B69",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addZone();
                }}
              />
              <button
                type="button"
                onClick={addZone}
                data-ocid="family.open_modal_button"
                className="w-full rounded-xl py-2.5 font-black text-sm text-white transition-transform active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
                }}
              >
                + ADD ZONE
              </button>
            </div>
          )}
          {safeZones.length === 0 ? (
            <p
              className="text-center text-sm font-semibold py-3"
              style={{ color: "#7C3AED" }}
              data-ocid="family.empty_state"
            >
              🌟 No safe zones yet — add your first one!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {safeZones.map((zone, idx) => (
                <div
                  key={zone.id}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold text-xs"
                  style={{
                    backgroundColor: "white",
                    border: "2px solid #8B5CF6",
                    color: "#4C1D95",
                  }}
                  data-ocid={`family.item.${idx + 1}`}
                >
                  <span>🏠 {zone.name}</span>
                  <span style={{ color: "#A78BFA" }}>·</span>
                  <span className="opacity-70">{zone.address}</span>
                  <button
                    type="button"
                    onClick={() => removeZone(zone.id)}
                    data-ocid={`family.delete_button.${idx + 1}`}
                    className="ml-1 text-red-400 hover:text-red-600 font-black text-xs leading-none transition-colors"
                    aria-label={`Remove ${zone.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          {safeZones.length >= 5 && (
            <p
              className="text-xs font-semibold mt-2"
              style={{ color: "#7C3AED" }}
            >
              Max 5 zones reached
            </p>
          )}
        </motion.div>

        {/* Safety Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: "#FCE7F3", border: "3px solid #EC4899" }}
        >
          <h2 className="text-lg font-black mb-4" style={{ color: "#831843" }}>
            💡 Safety Tips for Kids
          </h2>
          <div className="space-y-3">
            {TIPS.map((tip, i) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
                className="flex items-start gap-3 rounded-xl p-3"
                style={{
                  backgroundColor: "white",
                  border: `2px solid ${BORDER_COLORS[i % BORDER_COLORS.length]}`,
                }}
              >
                <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#44403C" }}
                >
                  {tip.text}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer blurb */}
        <p
          className="text-center text-xs font-semibold pb-4"
          style={{ color: "#A89884" }}
        >
          🌈 BLACKGRID Family Safety Zone — powered by love ❤️
        </p>
      </div>

      {/* Call Confirmation Dialog */}
      <AnimatePresence>
        {callConfirm && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCallConfirm(null)}
            data-ocid="family.dialog"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="rounded-3xl p-8 mx-6 max-w-sm w-full text-center shadow-2xl"
              style={{ backgroundColor: "white", border: "3px solid #8B5CF6" }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-5xl mb-4">📞</p>
              <h3
                className="text-xl font-black mb-2"
                style={{ color: "#4C1D95" }}
              >
                Are you sure?
              </h3>
              <p
                className="text-sm font-semibold mb-6"
                style={{ color: "#78716C" }}
              >
                {callConfirm.label}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCallConfirm(null)}
                  data-ocid="family.cancel_button"
                  className="flex-1 rounded-xl py-3 font-black text-sm"
                  style={{ backgroundColor: "#F3F4F6", color: "#374151" }}
                >
                  CANCEL
                </button>
                <a
                  href={callConfirm.href}
                  onClick={() => setCallConfirm(null)}
                  data-ocid="family.confirm_button"
                  className="flex-1 rounded-xl py-3 font-black text-sm text-white text-center block"
                  style={{
                    background: "linear-gradient(135deg, #10B981, #059669)",
                  }}
                >
                  CALL NOW
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
