/**
 * LandingPage — home screen with sea-blue party aesthetic.
 */

import { motion } from "framer-motion";
import { Bell, Gamepad2, Users, Star, Flame, ChevronRight } from "lucide-react";
import { useGameStore, GAME_PHASES } from "../store/gameStore";
import { Button } from "../components/ui/Button";
import { isOnlineMode } from "../lib/firebase";

const HOW_TO = [
  { icon: Users,  color: "bg-sky-100 text-sky-600",       label: "Form teams",       desc: "2–6 teams, each on their own device" },
  { icon: Bell,   color: "bg-red-100 text-red-600",       label: "Listen for um/uh", desc: "Other teams tap DING to catch violations" },
  { icon: Star,   color: "bg-amber-100 text-amber-600",   label: "Land on rules",    desc: "Yellow spaces reveal special rules" },
  { icon: Flame,  color: "bg-orange-100 text-orange-600", label: "Danger Zone",      desc: "Last 5 spaces — everyone must be perfect" },
];

function FloatBlob({ size, color, style }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: "blur(70px)", opacity: 0.35, ...style }}
      animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: style.delay ?? 0 }}
    />
  );
}

export function LandingPage() {
  const setPhase = useGameStore((s) => s.setPhase);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Decorative blobs */}
      <FloatBlob size={500} color="#0ea5e9" style={{ top: "-10%", left: "-10%",  delay: 0   }} />
      <FloatBlob size={400} color="#06b6d4" style={{ top: "60%",  right: "-8%", delay: 1.5 }} />
      <FloatBlob size={350} color="#38bdf8" style={{ bottom: "5%", left: "20%", delay: 3   }} />

      <div className="relative z-10 text-center max-w-2xl w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280 }}
          className="inline-flex items-center gap-2 rounded-full bg-white border border-sky-200 px-4 py-1.5 text-xs font-bold text-sky-500 uppercase tracking-widest shadow-sm mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          {isOnlineMode ? "Multiplayer Ready" : "Local Play Mode"}
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
        >
          <motion.div
            animate={{ rotate: [-4, 4, -2, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-sky-600 shadow-lg shadow-sky-200 mb-5"
          >
            <Bell size={38} className="text-white fill-white/20" />
          </motion.div>
          <h1 className="font-display text-6xl sm:text-7xl text-sky-950 mb-3">
            You Can't Say <span className="text-sky-600">"Umm!"</span>
          </h1>
          <p className="text-sky-500 text-xl mb-1">filler-word party game</p>
          <p className="text-sky-400 text-sm">2–6 teams · In-person play · 45 sec turns</p>
        </motion.div>

        {/* Tagline card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mt-8 rounded-3xl bg-white/80 border border-sky-100 shadow-sm p-6 text-sky-700 text-base leading-relaxed"
        >
          Describe word combinations to your team…{" "}
          <strong className="text-sky-900">without saying um, uh, or any filler sounds.</strong>
          {" "}Other teams listen — and they've got the{" "}
          <strong className="text-red-600">DING button.</strong>
          {" "}Each team plays from their own phone or laptop.
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-3 mt-7 justify-center"
        >
          <Button size="xl" variant="primary" onClick={() => setPhase(GAME_PHASES.LOBBY)} icon={Gamepad2} className="flex-1 sm:flex-none">
            Create Game
          </Button>
          <Button size="xl" variant="secondary" onClick={() => setPhase(GAME_PHASES.LOBBY)} icon={ChevronRight} className="flex-1 sm:flex-none">
            Join with Code
          </Button>
        </motion.div>

        {!isOnlineMode && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-4 text-xs text-sky-300 text-center"
          >
            Add Firebase credentials in <code className="bg-sky-100 text-sky-600 px-1 rounded">.env.local</code> to unlock cross-device multiplayer
          </motion.p>
        )}

        {/* How to play grid */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {HOW_TO.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + i * 0.07 }}
              className="rounded-2xl bg-white border border-sky-100 p-4 text-left shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${item.color}`}>
                <item.icon size={18} />
              </div>
              <p className="text-sky-900 font-bold text-sm">{item.label}</p>
              <p className="text-sky-400 text-xs mt-0.5">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
