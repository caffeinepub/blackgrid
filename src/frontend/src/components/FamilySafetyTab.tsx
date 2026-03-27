import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

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

const PIN_COLORS = [
  "linear-gradient(135deg,#F59E0B,#D97706)",
  "linear-gradient(135deg,#10B981,#059669)",
  "linear-gradient(135deg,#8B5CF6,#7C3AED)",
  "linear-gradient(135deg,#EC4899,#DB2777)",
  "linear-gradient(135deg,#3B82F6,#2563EB)",
  "linear-gradient(135deg,#F59E0B,#D97706)",
  "linear-gradient(135deg,#10B981,#059669)",
  "linear-gradient(135deg,#8B5CF6,#7C3AED)",
  "linear-gradient(135deg,#EC4899,#DB2777)",
  "linear-gradient(135deg,#3B82F6,#2563EB)",
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

type PinDialogProps = {
  onSuccess: () => void;
  onClose: () => void;
  storedPin: string;
};

function PinDialog({ onSuccess, onClose, storedPin }: PinDialogProps) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const shakeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const press = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    setErrMsg("");
    if (next.length === 4) {
      if (next === storedPin) {
        setTimeout(() => onSuccess(), 200);
      } else {
        if (shakeTimeout.current) clearTimeout(shakeTimeout.current);
        setShake(true);
        setErrMsg("Oops! Try again 🙈");
        shakeTimeout.current = setTimeout(() => {
          setShake(false);
          setDigits("");
          setErrMsg("");
        }, 900);
      }
    }
  };

  const backspace = () => {
    setDigits((d) => d.slice(0, -1));
    setErrMsg("");
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-ocid="family.modal"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="rounded-3xl p-7 mx-5 max-w-xs w-full shadow-2xl"
        style={{ backgroundColor: "#FFF9F0", border: "4px solid #8B5CF6" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <p className="text-4xl mb-1">🔒</p>
          <h3 className="text-xl font-black" style={{ color: "#4C1D95" }}>
            Parent Settings
          </h3>
          <p
            className="text-xs font-semibold mt-1"
            style={{ color: "#78716C" }}
          >
            Enter your 4-digit PIN
          </p>
        </div>

        {/* Dots display */}
        <motion.div
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.45 }}
          className="flex justify-center gap-4 mb-4"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-5 h-5 rounded-full border-2 transition-all duration-150"
              style={{
                backgroundColor: digits.length > i ? "#8B5CF6" : "transparent",
                borderColor: "#8B5CF6",
                transform: digits.length > i ? "scale(1.2)" : "scale(1)",
              }}
            />
          ))}
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {errMsg && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm font-black mb-3"
              style={{ color: "#EF4444" }}
              data-ocid="family.error_state"
            >
              {errMsg}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, i) => (
            <button
              key={n}
              type="button"
              onClick={() => press(String(n))}
              className="rounded-2xl py-4 font-black text-xl text-white transition-transform active:scale-90"
              style={{ background: PIN_COLORS[i % PIN_COLORS.length] }}
              data-ocid={"family.button"}
            >
              {n}
            </button>
          ))}
          {/* Row: empty | 0 | backspace */}
          <div />
          <button
            type="button"
            onClick={() => press("0")}
            className="rounded-2xl py-4 font-black text-xl text-white transition-transform active:scale-90"
            style={{ background: "linear-gradient(135deg,#EC4899,#DB2777)" }}
            data-ocid="family.button"
          >
            0
          </button>
          <button
            type="button"
            onClick={backspace}
            className="rounded-2xl py-4 font-black text-xl transition-transform active:scale-90"
            style={{ backgroundColor: "#F3F4F6", color: "#374151" }}
            data-ocid="family.cancel_button"
          >
            ⌫
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-2xl py-2.5 font-bold text-sm"
          style={{ backgroundColor: "#F3F4F6", color: "#6B7280" }}
          data-ocid="family.close_button"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}

type ParentSettingsProps = {
  parentPhone: string;
  onPhoneChange: (v: string) => void;
  safeZones: { id: string; name: string; address: string }[];
  onAddZone: (name: string, address: string) => void;
  onRemoveZone: (id: string) => void;
  currentPin: string;
  onPinChange: (v: string) => void;
  onClose: () => void;
};

function ParentSettingsPanel({
  parentPhone,
  onPhoneChange,
  safeZones,
  onAddZone,
  onRemoveZone,
  currentPin,
  onPinChange,
  onClose,
}: ParentSettingsProps) {
  const [phoneInput, setPhoneInput] = useState(parentPhone);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [zoneName, setZoneName] = useState("");
  const [zoneAddress, setZoneAddress] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");

  const savePhone = () => {
    if (!phoneInput.trim()) return;
    onPhoneChange(phoneInput.trim());
    setPhoneSaved(true);
    setTimeout(() => setPhoneSaved(false), 2500);
  };

  const addZone = () => {
    if (!zoneName.trim() || !zoneAddress.trim()) return;
    if (safeZones.length >= 5) return;
    onAddZone(zoneName.trim(), zoneAddress.trim());
    setZoneName("");
    setZoneAddress("");
  };

  const savePin = () => {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setPinMsg("❌ PIN must be exactly 4 digits");
      setTimeout(() => setPinMsg(""), 2500);
      return;
    }
    if (newPin !== confirmPin) {
      setPinMsg("❌ PINs don't match — try again");
      setTimeout(() => setPinMsg(""), 2500);
      return;
    }
    onPinChange(newPin);
    setNewPin("");
    setConfirmPin("");
    setPinMsg("✅ PIN updated!");
    setTimeout(() => setPinMsg(""), 2500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9990] flex items-end sm:items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-ocid="family.dialog"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 280 }}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: "#FFF9F0", border: "4px solid #F59E0B" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <h3 className="text-xl font-black" style={{ color: "#92400E" }}>
              Parent Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center font-black text-lg transition-transform active:scale-90"
            style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}
            data-ocid="family.close_button"
          >
            ✕
          </button>
        </div>

        {/* Phone Number */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: "#FEF9C3", border: "3px solid #F59E0B" }}
        >
          <h4 className="font-black text-sm mb-2" style={{ color: "#92400E" }}>
            📞 Parent Phone Number
          </h4>
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
              className="flex-1 rounded-xl px-3 py-2 font-semibold outline-none text-sm"
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
              className="rounded-xl px-4 py-2 font-black text-sm transition-transform active:scale-95 text-white"
              style={{
                background: "linear-gradient(135deg, #F59E0B, #D97706)",
              }}
            >
              SAVE
            </button>
          </div>
          <AnimatePresence>
            {phoneSaved && (
              <motion.p
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1.5 text-xs font-bold"
                style={{ color: "#065F46" }}
                data-ocid="family.success_state"
              >
                ✅ Phone number saved!
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Safe Zones */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ backgroundColor: "#EDE9FE", border: "3px solid #8B5CF6" }}
        >
          <h4 className="font-black text-sm mb-3" style={{ color: "#4C1D95" }}>
            🏠 Safe Zones ({safeZones.length}/5)
          </h4>
          {safeZones.length < 5 && (
            <div className="space-y-2 mb-3">
              <input
                type="text"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                placeholder="Zone name (e.g. Home, School)"
                data-ocid="family.search_input"
                className="w-full rounded-xl px-3 py-2 font-semibold outline-none text-sm"
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
                className="w-full rounded-xl px-3 py-2 font-semibold outline-none text-sm"
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
                className="w-full rounded-xl py-2 font-black text-sm text-white transition-transform active:scale-95"
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
              className="text-center text-xs font-semibold py-2"
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
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs"
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
                    onClick={() => onRemoveZone(zone.id)}
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
        </div>

        {/* Change PIN */}
        <div
          className="rounded-2xl p-4 mb-2"
          style={{ backgroundColor: "#FCE7F3", border: "3px solid #EC4899" }}
        >
          <h4 className="font-black text-sm mb-2" style={{ color: "#831843" }}>
            🔑 Change PIN (current: {currentPin})
          </h4>
          <div className="space-y-2">
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) =>
                setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="New 4-digit PIN"
              className="w-full rounded-xl px-3 py-2 font-semibold outline-none text-sm"
              style={{
                border: "2px solid #EC4899",
                backgroundColor: "white",
                color: "#44403C",
              }}
            />
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) =>
                setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="Confirm new PIN"
              className="w-full rounded-xl px-3 py-2 font-semibold outline-none text-sm"
              style={{
                border: "2px solid #EC4899",
                backgroundColor: "white",
                color: "#44403C",
              }}
            />
            <button
              type="button"
              onClick={savePin}
              className="w-full rounded-xl py-2 font-black text-sm text-white transition-transform active:scale-95"
              style={{
                background: "linear-gradient(135deg, #EC4899, #DB2777)",
              }}
              data-ocid="family.submit_button"
            >
              UPDATE PIN 🔑
            </button>
          </div>
          <AnimatePresence>
            {pinMsg && (
              <motion.p
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-1.5 text-xs font-bold"
                style={{
                  color: pinMsg.startsWith("✅") ? "#065F46" : "#EF4444",
                }}
              >
                {pinMsg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FamilySafetyTab() {
  const [parentPhone, setParentPhone] = useState(
    () => localStorage.getItem("bg_parent_phone") ?? "",
  );
  const [safeZones, setSafeZones] = useState<
    { id: string; name: string; address: string }[]
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("bg_safe_zones") ?? "[]");
    } catch {
      return [];
    }
  });
  const [pin, setPin] = useState(
    () => localStorage.getItem("bg_parent_pin") ?? "0000",
  );
  const [safeMsg, setSafeMsg] = useState("");
  const [callConfirm, setCallConfirm] = useState<null | {
    label: string;
    href: string;
  }>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem("bg_safe_zones", JSON.stringify(safeZones));
  }, [safeZones]);

  const handlePhoneChange = (v: string) => {
    setParentPhone(v);
    localStorage.setItem("bg_parent_phone", v);
  };

  const handlePinChange = (v: string) => {
    setPin(v);
    localStorage.setItem("bg_parent_pin", v);
  };

  const handleAddZone = (name: string, address: string) => {
    setSafeZones((prev) => [
      ...prev,
      { id: `zone-${Date.now()}`, name, address },
    ]);
  };

  const handleRemoveZone = (id: string) => {
    setSafeZones((prev) => prev.filter((z) => z.id !== id));
  };

  const handlePinSuccess = () => {
    setShowPinDialog(false);
    setShowSettings(true);
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

        {/* Parent phone display (read-only, locked) */}
        {parentPhone && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-2xl px-5 py-3 flex items-center gap-3"
            style={{ backgroundColor: "#FEF9C3", border: "3px solid #F59E0B" }}
          >
            <span className="text-xl">📞</span>
            <div className="flex-1">
              <p className="text-xs font-bold" style={{ color: "#92400E" }}>
                Parent Number
              </p>
              <p className="text-sm font-black" style={{ color: "#44403C" }}>
                {parentPhone}
              </p>
            </div>
            <div
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
            >
              ✅ Connected
            </div>
          </motion.div>
        )}

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

        {/* Safe Zones display (read-only) */}
        {safeZones.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="rounded-2xl p-4"
            style={{ backgroundColor: "#EDE9FE", border: "3px solid #8B5CF6" }}
          >
            <h2
              className="text-sm font-black mb-3"
              style={{ color: "#4C1D95" }}
            >
              🏠 Safe Zones
            </h2>
            <div className="flex flex-wrap gap-2">
              {safeZones.map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold text-xs"
                  style={{
                    backgroundColor: "white",
                    border: "2px solid #8B5CF6",
                    color: "#4C1D95",
                  }}
                >
                  <span>🏠 {zone.name}</span>
                  <span style={{ color: "#A78BFA" }}>·</span>
                  <span className="opacity-70">{zone.address}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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

        {/* Parent Settings Lock Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          className="rounded-2xl p-5"
          style={{ backgroundColor: "#F0FDF4", border: "3px dashed #10B981" }}
        >
          <div className="text-center">
            <p
              className="text-xs font-semibold mb-3"
              style={{ color: "#065F46" }}
            >
              Parents: manage phone number, safe zones & PIN
            </p>
            <button
              type="button"
              onClick={() => setShowPinDialog(true)}
              className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-black text-sm text-white transition-transform active:scale-95 shadow-md"
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
              }}
              data-ocid="family.open_modal_button"
            >
              🔒 Parent Settings
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <p
          className="text-center text-xs font-semibold pb-4"
          style={{ color: "#A89884" }}
        >
          🌈 BLACKGRID Family Safety Zone — powered by love ❤️
        </p>
      </div>

      {/* PIN Dialog */}
      <AnimatePresence>
        {showPinDialog && (
          <PinDialog
            storedPin={pin}
            onSuccess={handlePinSuccess}
            onClose={() => setShowPinDialog(false)}
          />
        )}
      </AnimatePresence>

      {/* Parent Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <ParentSettingsPanel
            parentPhone={parentPhone}
            onPhoneChange={handlePhoneChange}
            safeZones={safeZones}
            onAddZone={handleAddZone}
            onRemoveZone={handleRemoveZone}
            currentPin={pin}
            onPinChange={handlePinChange}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>

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
