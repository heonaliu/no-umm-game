/** TeamProgressBar — animated progress tracker for all teams. */

import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import clsx from "clsx";

export function TeamProgressBar() {
  const teams            = useGameStore((s) => s.teams);
  const boardLength      = useGameStore((s) => s.boardLength);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);

  return (
    <div className="space-y-2">
      {teams.map((team, i) => {
        const pct      = Math.min((team.position / boardLength) * 100, 100);
        const isActive = i === currentTeamIndex;

        return (
          <div
            key={team.id}
            className={clsx(
              "rounded-xl p-3 border transition-all",
              isActive
                ? "border-indigo-300 bg-indigo-50 shadow-sm"
                : "border-indigo-100 bg-white"
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{team.pawn}</span>
                <span className="font-display font-bold text-sm" style={{ color: team.color?.hex }}>
                  {team.name}
                </span>
                {isActive && (
                  <span className="text-[10px] text-indigo-600 font-bold bg-indigo-100 px-1.5 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                )}
              </div>
              <span className="text-xs text-indigo-300 font-mono">
                {team.position}/{boardLength}
              </span>
            </div>

            <div className="h-2 rounded-full bg-indigo-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: team.color?.hex ?? "#6366f1" }}
                animate={{ width: `${pct}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 14 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
