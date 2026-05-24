/**
 * LandingPage — the game's home screen.
 * Shows title, tagline, and Create / Join buttons.
 */

import { motion } from "framer-motion";
import { useGameStore, GAME_PHASES } from "../store/gameStore";
import { Button } from "../components/ui/Button";

// Floating background orbs
function Orb({ size, color, top, left, delay }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        background: color,
        top,
        left,
        filter: "blur(60px)",
        opacity: 0.25,
      }}
      animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
      transition={{ duration: 6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

export function LandingPage() {
  const setPhase = useGameStore((s) => s.setPhase);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Background orbs */}
      <Orb size={400} color="#6366f1" top="10%"  left="5%"  delay={0} />
      <Orb size={350} color="#a855f7" top="60%"  left="70%" delay={1.5} />
      <Orb size={300} color="#ec4899" top="20%"  left="80%" delay={3} />
      <Orb size={250} color="#06b6d4" top="75%"  left="15%" delay={2} />

      {/* Star field */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{
              duration: 2 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* Logo / Title */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <motion.p
            className="text-6xl mb-4"
            animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
          >
            🔔
          </motion.p>
          <h1 className="font-display text-7xl text-white text-shadow-lg mb-2 leading-none">
            No <span className="text-violet-400">Umm!</span>
          </h1>
          <p className="text-white/50 text-xl font-body mb-1">
            The filler-word party game
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-white/30">
            <span>2–6 teams</span>
            <span>•</span>
            <span>In-person play</span>
            <span>•</span>
            <span>45 sec turns</span>
          </div>
        </motion.div>

        {/* Tagline card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mt-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-white/70 text-base leading-relaxed"
        >
          Describe random word combinations to your team…{" "}
          <strong className="text-white">without saying um, uh, or any filler words.</strong>
          {" "}Other teams are listening — and they've got the{" "}
          <strong className="text-red-400">DING button.</strong> 🔔
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 mt-8 justify-center"
        >
          <Button
            size="xl"
            variant="primary"
            onClick={() => setPhase(GAME_PHASES.LOBBY)}
            className="flex-1 sm:flex-none"
          >
            🎮 Create Game
          </Button>
          <Button
            size="xl"
            variant="secondary"
            onClick={() => setPhase(GAME_PHASES.LOBBY)}
            className="flex-1 sm:flex-none"
          >
            🔑 Join Game
          </Button>
        </motion.div>

        {/* How to play blurb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center"
        >
          {[
            { emoji: "🎯", label: "Describe words" },
            { emoji: "🔔", label: "Call out umms" },
            { emoji: "⭐", label: "Land on rules" },
            { emoji: "🏆", label: "Race to finish" },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="text-3xl mb-1">{item.emoji}</div>
              <div className="text-white/60 text-sm">{item.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
