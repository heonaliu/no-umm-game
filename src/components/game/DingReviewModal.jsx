/**
 * DingReviewModal — shown when a DING is pressed.
 * The host confirms (valid ding → ding team scores) or rejects (timer resumes).
 */

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, TURN_PHASES } from "../../store/gameStore";
import { Button } from "../ui/Button";

export function DingReviewModal() {
  const turnPhase = useGameStore((s) => s.turnPhase);
  const dingTeamIndex = useGameStore((s) => s.dingTeamIndex);
  const teams = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const confirmDing = useGameStore((s) => s.confirmDing);
  const rejectDing = useGameStore((s) => s.rejectDing);

  const isOpen = turnPhase === TURN_PHASES.DING_REVIEW && dingTeamIndex !== null;
  const dingTeam = teams[dingTeamIndex];
  const activeTeam = teams[currentTeamIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 60 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-md rounded-3xl border-4 border-red-500/60 bg-[#1a0a0a] shadow-2xl shadow-red-900/50 p-7 text-center">
              {/* Ding icon */}
              <motion.div
                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="text-7xl mb-4"
              >
                🔔
              </motion.div>

              <h2 className="font-display text-3xl text-red-400 mb-1">DING!</h2>
              <p className="text-white/60 text-sm mb-6">
                Timer paused while the host reviews the call.
              </p>

              <div className="bg-white/5 rounded-2xl p-4 mb-6">
                <p className="text-white/50 text-sm mb-1">Called by</p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-3xl">{dingTeam?.pawn}</span>
                  <span className="font-display text-xl" style={{ color: dingTeam?.color?.hex }}>
                    {dingTeam?.name}
                  </span>
                </div>

                <div className="h-px bg-white/10 my-3" />

                <p className="text-white/50 text-sm mb-1">Against</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">{activeTeam?.pawn}</span>
                  <span className="font-display text-xl" style={{ color: activeTeam?.color?.hex }}>
                    {activeTeam?.name}
                  </span>
                </div>
              </div>

              <p className="text-white/40 text-xs mb-5">
                Did <strong className="text-white/70">{activeTeam?.name}</strong> say "um", "uh", a filler word, or break an active rule?
              </p>

              <div className="flex gap-3">
                <Button variant="success" size="lg" className="flex-1" onClick={confirmDing}>
                  ✅ Valid!
                  <span className="block text-xs font-body font-normal opacity-70">
                    {dingTeam?.name} +1 space
                  </span>
                </Button>
                <Button variant="ghost" size="lg" className="flex-1" onClick={rejectDing}>
                  ❌ No Call
                  <span className="block text-xs font-body font-normal opacity-70">
                    Resume timer
                  </span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
