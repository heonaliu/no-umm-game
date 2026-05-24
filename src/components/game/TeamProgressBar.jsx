/**
 * TeamProgressBar — compact progress tracker showing each team's
 * board position as a horizontal progress bar.
 */

import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import clsx from "clsx";

export function TeamProgressBar() {
  const teams = useGameStore((s) => s.teams);
  const boardLength = useGameStore((s) => s.boardLength);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);

  return (
    <div className="space-y-2">
      {teams.map((team, i) => {
        const pct = Math.min((team.position / boardLength) * 100, 100);
        const isActive = i === currentTeamIndex;

        return (
          <div key={team.id} className={clsx("rounded-xl p-3 border transition-all", isActive ? "border-violet-400/50 bg-violet-500/10" : "border-white/10 bg-white/5")}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{team.pawn}</span>
                <span
                  className="font-display font-bold text-sm"
                  style={{ color: team.color?.hex }}
                >
                  {team.name}
                </span>
                {isActive && (
                  <span className="text-xs text-violet-400 font-bold bg-violet-500/20 px-1.5 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-xs text-white/50 font-mono">
                {team.position}/{boardLength}
              </span>
            </div>

            {/* Progress track */}
            <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: team.color?.hex ?? "#8b5cf6" }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
