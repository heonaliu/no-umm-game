/**
 * ActiveRulesPanel — shows all currently active rules for each team.
 * Also shows the global "No um/uh" danger zone rule if applicable.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, isDangerZone } from "../../store/gameStore";
import { RuleCard } from "./RuleCard";

export function ActiveRulesPanel() {
  const teams = useGameStore((s) => s.teams);
  const boardLength = useGameStore((s) => s.boardLength);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const activeTeam = teams[currentTeamIndex];
  const inDanger = isDangerZone(activeTeam?.position ?? 0, boardLength);

  // Gather all unique active rules across all teams
  const allActiveRules = [];
  teams.forEach((team) => {
    (team.activeRules ?? []).forEach((rule) => {
      if (!allActiveRules.find((r) => r.id === rule.id)) {
        allActiveRules.push({ ...rule, teamName: team.name });
      }
    });
  });

  if (!inDanger && allActiveRules.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-white/30 text-sm">
        No active rules yet. Land on a ⭐ space to reveal rules!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-display text-white/70 text-sm uppercase tracking-widest">
        ⚠️ Active Rules
      </h3>

      {/* Danger zone rule */}
      <AnimatePresence>
        {inDanger && (
          <motion.div
            key="danger-rule"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-2xl border-2 border-red-500/60 bg-red-500/15 p-3 flex items-start gap-3"
          >
            <span className="text-2xl">🔥</span>
            <div>
              <h3 className="font-display text-white font-bold text-sm">
                DANGER ZONE — No Um / Uh
              </h3>
              <p className="text-red-300 text-xs mt-0.5">
                EVERYONE on the active team (including guessers) must not say "um" or "uh"!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Team-specific rules */}
      <AnimatePresence>
        {allActiveRules.map((rule, i) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <RuleCard rule={rule} compact />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
