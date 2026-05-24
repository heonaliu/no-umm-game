/**
 * DingButton — large button for non-active teams.
 *
 * Sound strategy: playDing() fires locally when pressing, AND
 * a global useEffect on dingCount fires on every device (including
 * devices that didn't press, so they hear the ding too).
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Mic } from "lucide-react";
import { useGameStore, TURN_PHASES } from "../../store/gameStore";
import { playDing } from "../../utils/sounds";
import clsx from "clsx";

/** Mounted once in GameplayPage — plays ding sound on ALL devices when dingCount changes. */
export function DingSoundListener() {
  const dingCount = useGameStore((s) => s.dingCount);
  useEffect(() => {
    if (dingCount > 0) playDing();
  }, [dingCount]);
  return null;
}

export function DingButton({ teamIndex }) {
  const team             = useGameStore((s) => s.teams[teamIndex]);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const turnPhase        = useGameStore((s) => s.turnPhase);
  const autoDing         = useGameStore((s) => s.autoDing);
  const pressDing        = useGameStore((s) => s.pressDing);
  const [rippling, setRippling] = useState(false);

  const isActiveTeam = currentTeamIndex === teamIndex;
  const canDing      = !isActiveTeam && turnPhase === TURN_PHASES.DESCRIBING;

  const handleDing = () => {
    if (!canDing) return;
    setRippling(true);
    setTimeout(() => setRippling(false), 700);
    pressDing(teamIndex); // sound fires via DingSoundListener watching dingCount
  };

  return (
    <motion.button
      onClick={handleDing}
      disabled={!canDing}
      whileHover={canDing ? { scale: 1.03 } : {}}
      whileTap={canDing ? { scale: 0.94 } : {}}
      transition={{ type: "spring", stiffness: 380, damping: 16 }}
      className={clsx(
        "relative overflow-hidden rounded-2xl border-2 w-full py-4 px-5 select-none transition-all",
        "flex items-center gap-3",
        canDing
          ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-200 cursor-pointer"
          : isActiveTeam
            ? "bg-sky-50 border-sky-200 text-sky-400 cursor-default"
            : "bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed opacity-50"
      )}
    >
      {/* Ripple */}
      <AnimatePresence>
        {rippling && (
          <motion.span
            key="r"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      <span className="text-2xl shrink-0 relative z-10">{team?.pawn}</span>
      <div className="text-left flex-1 min-w-0 relative z-10">
        <p className={clsx("text-xs font-bold uppercase tracking-widest", canDing ? "text-red-200" : "opacity-70")}>
          {isActiveTeam ? "Your Team Is Describing" : autoDing ? "Instant DING!" : "Press to DING"}
        </p>
        <p className="font-display text-lg leading-tight truncate" style={canDing ? {} : { color: team?.color?.hex }}>
          {team?.name}
        </p>
      </div>
      <div className="relative z-10 shrink-0">
        {isActiveTeam ? (
          <Mic size={24} className="text-sky-400" />
        ) : canDing ? (
          <motion.div
            animate={{ rotate: [-8, 8, -5, 5, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
          >
            <Bell size={28} className="text-white fill-white/20" />
          </motion.div>
        ) : (
          <Bell size={24} className="opacity-30" />
        )}
      </div>
    </motion.button>
  );
}
