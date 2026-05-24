/**
 * DingButton — large red button for non-active teams to press when they
 * catch a violation. Includes a ripple animation and the team's name.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, TURN_PHASES } from "../../store/gameStore";

export function DingButton({ teamIndex }) {
  const team = useGameStore((s) => s.teams[teamIndex]);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const turnPhase = useGameStore((s) => s.turnPhase);
  const pressDing = useGameStore((s) => s.pressDing);
  const [ripple, setRipple] = useState(false);

  const isActive = currentTeamIndex === teamIndex;
  const canDing = !isActive && turnPhase === TURN_PHASES.DESCRIBING;

  const handleDing = () => {
    if (!canDing) return;
    setRipple(true);
    setTimeout(() => setRipple(false), 700);
    pressDing(teamIndex);
  };

  return (
    <motion.button
      onClick={handleDing}
      disabled={!canDing}
      whileHover={canDing ? { scale: 1.04 } : {}}
      whileTap={canDing ? { scale: 0.93 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className={`
        relative overflow-hidden rounded-2xl border-4 py-4 px-6 w-full
        font-display font-bold text-xl text-white transition-all duration-200
        select-none cursor-pointer
        ${canDing
          ? "bg-red-600 border-red-400 hover:bg-red-500 shadow-lg shadow-red-900/60 active:bg-red-700"
          : isActive
            ? "bg-violet-700/40 border-violet-500/40 opacity-80 cursor-default"
            : "bg-white/5 border-white/10 opacity-40 cursor-not-allowed"
        }
      `}
    >
      {/* Ripple effect */}
      <AnimatePresence>
        {ripple && (
          <motion.span
            key="ripple"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/40 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-center gap-2 relative z-10">
        <span className="text-3xl">{team?.pawn}</span>
        <div className="text-left">
          <div className="text-base leading-none text-white/60 font-body">
            {isActive ? "ACTIVE TEAM" : "DING!"}
          </div>
          <div className="text-lg leading-tight" style={{ color: team?.color?.hex }}>
            {team?.name}
          </div>
        </div>
        {canDing && (
          <span className="ml-auto text-4xl animate-bounce">🔔</span>
        )}
        {isActive && (
          <span className="ml-auto text-2xl">🎤</span>
        )}
      </div>
    </motion.button>
  );
}
