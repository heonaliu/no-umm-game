/** ActiveRulesPanel — displays all currently active rules + danger zone rule. */

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Shield } from "lucide-react";
import { useGameStore, isDangerZone } from "../../store/gameStore";
import { RuleCard } from "./RuleCard";

export function ActiveRulesPanel() {
  const teams            = useGameStore((s) => s.teams);
  const boardLength      = useGameStore((s) => s.boardLength);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const activeTeam       = teams[currentTeamIndex];
  const inDanger         = isDangerZone(activeTeam?.position ?? 0, boardLength);

  const allActiveRules = [];
  teams.forEach((team) => {
    (team.activeRules ?? []).forEach((rule) => {
      if (!allActiveRules.find((r) => r.id === rule.id)) {
        allActiveRules.push(rule);
      }
    });
  });

  if (!inDanger && allActiveRules.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 text-center text-indigo-300 text-sm flex items-center justify-center gap-2">
        <Shield size={15} />
        No active rules yet — land on a <span className="text-amber-500 font-bold">★</span> space to reveal them
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
        <Shield size={13} /> Active Rules
      </p>

      <AnimatePresence>
        {inDanger && (
          <motion.div
            key="danger"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl border-2 border-red-200 bg-red-50 p-3 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <Flame size={16} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-display text-red-700 text-sm">DANGER ZONE — No Um / Uh</h3>
              <p className="text-red-500/80 text-xs mt-0.5">
                EVERYONE on the active team (including guessers) must avoid filler sounds!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {allActiveRules.map((rule, i) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <RuleCard rule={rule} compact />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
