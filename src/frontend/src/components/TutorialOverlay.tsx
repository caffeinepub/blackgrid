import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Map as MapIcon,
  Navigation,
  Pause,
  Play,
  Radio,
  Shield,
  User,
  UserX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface TutorialStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  narration: string;
}

const STEPS: TutorialStep[] = [
  {
    icon: <Eye size={64} />,
    title: "WELCOME TO BLACKGRID",
    description:
      "BLACKGRID is your personal security intelligence system — real-time threat awareness, verified identity, and AI-powered situational control. Designed for those who move through the world with purpose and precision.",
    narration:
      "Welcome to BLACKGRID — the most advanced personal security intelligence platform available. You now have access to real-time threat mapping, verified identity protocols, and military-grade situational awareness. This system was built for those who refuse to move through the world blind.",
  },
  {
    icon: <MapIcon size={64} />,
    title: "DASHBOARD & THREAT MAP",
    description:
      "The live SF threat grid shows risk zones, verified operatives, blind spots, and your GPS location in real time. Red zones indicate high-risk areas. Your position is tracked as a live dot on the grid.",
    narration:
      "Your dashboard anchors the live San Francisco threat grid. Risk zones are color-coded by severity — red for high, amber for elevated, green for clear. Your GPS position appears as a live dot, updated continuously as you move through the city.",
  },
  {
    icon: <Radio size={64} />,
    title: "INTELLIGENCE FEED",
    description:
      "Live incident data aggregated from public safety sources — SFPD reports, emergency feeds, and network signals. The Intelligence Feed is free for all users. Elite members unlock the full feed with priority alerts.",
    narration:
      "The Intelligence Feed pulls live incident data from public safety sources, including SFPD reports and local emergency feeds. Basic access is free for all users. Elite members receive priority alerts, expanded coverage, and deeper incident analysis.",
  },
  {
    icon: <Navigation size={64} />,
    title: "ROUTE DEFENSE",
    description:
      "Input a start and end point, tap USE GPS to auto-fill your position, then calculate the safest route. Live GPS tracking, auto-recalculation, compass heading, and dynamic avoidance of high-crime zones are all active.",
    narration:
      "Route Defense calculates your safest path through the city in real time. Enter your start and destination, or tap USE GPS to lock your current position. The system avoids high-crime zones dynamically and recalculates your route as your GPS updates.",
  },
  {
    icon: <UserX size={64} />,
    title: "SEX OFFENDER REGISTRY",
    description:
      "Searchable local offender database with Tier I, II, and III badges, registration numbers, offense types, and SF neighborhood locations. Filter by name, location, or offense category. Admin controls add and remove entries.",
    narration:
      "The Registry tab gives you direct access to the local sex offender database. Each entry includes tier classification, registration number, offense type, and neighborhood location. Search and filter by name, area, or offense category to assess your surroundings.",
  },
  {
    icon: <Shield size={64} />,
    title: "GUARDS — BLACK TIER",
    description:
      "Invite-only bodyguard hiring program. Black Tier membership starts at $300. Browse vetted SF operatives, filter by specialty and availability, and send hire requests directly. 24–72 hours advance notice required.",
    narration:
      "The GUARDS tab is exclusive to Black Tier members. Hire vetted, professional operatives in San Francisco and beyond. Armed and unarmed options are available. Pricing is calculated live based on number of guards, hours, and configuration. Apply for Black Tier through the Subscription tab.",
  },
  {
    icon: <User size={64} />,
    title: "PROFILE & IDENTITY BADGE",
    description:
      "Your secure BLACKGRID identity badge with QR code for verified networking. Set your name, badge type, and tier. Admin receives a gold ADMINISTRATOR badge with full clearance. Tap-to-share via phone NFC or QR scan.",
    narration:
      "Your Profile tab houses your BLACKGRID identity badge — a secure, QR-encoded credential for verified networking. Set your display name and badge type. Admin receives a gold ADMINISTRATOR badge with full clearance designation. Share your identity via phone tap or QR scan.",
  },
];

interface TutorialOverlayProps {
  onClose: () => void;
}

export default function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopSpeech = useCallback(() => {
    window.speechSynthesis?.cancel();
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!window.speechSynthesis) return;
      stopSpeech();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 0.85;
      utterance.volume = 1;
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [stopSpeech],
  );

  const goToStep = useCallback(
    (index: number, withSpeech = true) => {
      stopSpeech();
      setStep(index);
      if (withSpeech && !paused) {
        setTimeout(() => {
          speak(STEPS[index].narration, () => {
            if (index < STEPS.length - 1) {
              autoAdvanceRef.current = setTimeout(() => {
                goToStep(index + 1);
              }, 800);
            }
          });
        }, 300);
      }
    },
    [paused, speak, stopSpeech],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    goToStep(0);
    return () => {
      stopSpeech();
    };
  }, []);

  const handlePauseToggle = () => {
    if (paused) {
      setPaused(false);
      speak(STEPS[step].narration, () => {
        if (step < STEPS.length - 1) {
          autoAdvanceRef.current = setTimeout(() => {
            goToStep(step + 1);
          }, 800);
        }
      });
    } else {
      setPaused(true);
      stopSpeech();
    }
  };

  const handlePrev = () => {
    if (step > 0) goToStep(step - 1, !paused);
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) goToStep(step + 1, !paused);
  };

  const handleClose = () => {
    stopSpeech();
    onClose();
  };

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,0,0,0.92)" }}
        data-ocid="tutorial.modal"
      >
        {/* Panel */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative w-full max-w-2xl mx-4 border border-[#C9A95C33] bg-[#0A0A0A]"
          style={{
            boxShadow:
              "0 0 60px rgba(201,169,92,0.12), 0 0 120px rgba(0,0,0,0.8)",
          }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={handleClose}
            data-ocid="tutorial.close_button"
            className="absolute top-4 right-4 text-[#555] hover:text-[#C9A95C] transition-colors z-10"
            aria-label="Close tutorial"
          >
            <X size={18} />
          </button>

          {/* Header bar */}
          <div className="px-8 pt-8 pb-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1 h-4 bg-[#C9A95C]" />
              <span className="text-[9px] tracking-widest uppercase text-[#C9A95C] font-bold">
                HOW IT WORKS
              </span>
              <span className="ml-auto text-[9px] tracking-widest text-[#555]">
                {step + 1} / {STEPS.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-px bg-[#1A1A1A] mt-3 mb-0">
              <motion.div
                className="h-full bg-[#C9A95C]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 pt-5 pb-0 px-8">
            {STEPS.map((s, i) => (
              <button
                key={s.title}
                type="button"
                onClick={() => goToStep(i, !paused)}
                aria-label={`Go to step ${i + 1}`}
                className="transition-all"
              >
                <div
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 24 : 6,
                    height: 6,
                    backgroundColor:
                      i === step
                        ? "#C9A95C"
                        : i < step
                          ? "#C9A95C55"
                          : "#2A2A2A",
                  }}
                />
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="px-8 pt-8 pb-4 min-h-[300px] flex flex-col items-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center gap-6"
              >
                {/* Icon */}
                <div
                  className="flex items-center justify-center w-24 h-24 border border-[#C9A95C33]"
                  style={{ color: "#C9A95C" }}
                >
                  {current.icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold tracking-widest uppercase text-[#EDEDED]">
                  {current.title}
                </h2>

                {/* Description */}
                <p className="text-sm leading-relaxed text-[#B8B8B8] max-w-lg">
                  {current.description}
                </p>

                {/* Speaking indicator */}
                <div className="flex items-center gap-2 h-4">
                  {!paused && (
                    <>
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-0.5 bg-[#C9A95C]"
                          animate={{ height: [4, 14, 4] }}
                          transition={{
                            duration: 0.6,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.12,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                      <span className="text-[9px] tracking-widest uppercase text-[#C9A95C55] ml-1">
                        NARRATING
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between px-8 py-6 border-t border-[#1A1A1A]">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 0}
              data-ocid="tutorial.pagination_prev"
              className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#555] hover:text-[#C9A95C] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
              PREV
            </button>

            <button
              type="button"
              onClick={handlePauseToggle}
              data-ocid="tutorial.toggle"
              className="flex items-center gap-2 px-6 py-2 border border-[#C9A95C33] text-[10px] tracking-widest uppercase text-[#C9A95C] hover:border-[#C9A95C] hover:bg-[#C9A95C0A] transition-all"
            >
              {paused ? <Play size={12} /> : <Pause size={12} />}
              {paused ? "PLAY" : "PAUSE"}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                data-ocid="tutorial.pagination_next"
                className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#C9A95C] hover:text-[#E8C878] transition-colors"
              >
                NEXT
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClose}
                data-ocid="tutorial.close_button"
                className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-[#C9A95C] hover:text-[#E8C878] transition-colors"
              >
                ENTER GRID
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
