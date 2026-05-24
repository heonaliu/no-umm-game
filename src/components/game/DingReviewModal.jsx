/**
 * DingReviewModal — shown on all devices when a DING is pressed.
 * The host / active team confirms or rejects the call.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, XCircle } from "lucide-react";
import { useGameStore, TURN_PHASES } from "../../store/gameStore";
import { Button } from "../ui/Button";

export function DingReviewModal() {
  const turnPhase        = useGameStore((s) => s.turnPhase);
  const dingTeamIndex    = useGameStore((s) => s.dingTeamIndex);
  const teams            = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const confirmDing      = useGameStore((s) => s.confirmDing);
  const rejectDing       = useGameStore((s) => s.rejectDing);

  const isOpen    = turnPhase === TURN_PHASES.DING_REVIEW && dingTeamIndex !== null;
  const dingTeam  = teams[dingTeamIndex];
  const activeTeam = teams[currentTeamIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm z-50"
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.75, y: 60 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{   opacity: 0, scale: 0.75,   y: 60 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm rounded-3xl bg-white border-2 border-red-200 shadow-2xl shadow-red-100 p-7 text-center">
              <motion.div
                animate={{ rotate: [-12, 12, -8, 8, 0] }}
                transition={{ duration: 0.7 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4"
              >
                <Bell size={32} className="text-red-600 fill-red-200" />
              </motion.div>

              <h2 className="font-display text-3xl text-red-600 mb-1">DING!</h2>
              <p className="text-indigo-500 text-sm mb-5">Timer paused — host reviews the call</p>

              <div className="bg-indigo-50 rounded-2xl p-4 mb-5 space-y-3">
                <div>
                  <p className="text-xs text-indigo-400 mb-1">Called by</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{dingTeam?.pawn}</span>
                    <span className="font-display text-lg" style={{ color: dingTeam?.color?.hex }}>
                      {dingTeam?.name}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-indigo-100" />
                <div>
                  <p className="text-xs text-indigo-400 mb-1">Against</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{activeTeam?.pawn}</span>
                    <span className="font-display text-lg" style={{ color: activeTeam?.color?.hex }}>
                      {activeTeam?.name}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-indigo-400 text-xs mb-5">
                Did <strong className="text-indigo-700">{activeTeam?.name}</strong> say "um", "uh", a filler sound, or break an active rule?
              </p>

              <div className="flex gap-3">
                <Button
                  variant="success" size="lg" className="flex-1 flex-col gap-0.5 py-3"
                  onClick={confirmDing}
                >
                  <CheckCircle size={20} />
                  <span className="text-base">Valid!</span>
                  <span className="text-xs font-body font-normal opacity-75">{dingTeam?.name} +1</span>
                </Button>
                <Button
                  variant="secondary" size="lg" className="flex-1 flex-col gap-0.5 py-3"
                  onClick={rejectDing}
                >
                  <XCircle size={20} className="text-indigo-400" />
                  <span className="text-base text-indigo-700">No Call</span>
                  <span className="text-xs font-body font-normal text-indigo-400">Resume</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
