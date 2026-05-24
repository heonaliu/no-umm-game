/**
 * BoardCell — a single space on the game board.
 *
 * Types:
 *   normal  — white/blue cell
 *   yellow  — rule-trigger cell (every 5th space)
 *   danger  — last 5 spaces, glowing red
 *   start   — space 0
 *   finish  — last space
 */

import clsx from "clsx";
import { motion } from "framer-motion";

export function BoardCell({ position, type, pawns = [], isActive = false }) {
  const cellClasses = clsx(
    "relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300",
    "min-w-[44px] min-h-[44px] w-11 h-11",
    {
      // Start cell
      "bg-emerald-500/30 border-emerald-400 text-emerald-300": type === "start",
      // Finish cell
      "bg-gradient-to-br from-yellow-400/40 to-amber-500/40 border-yellow-400 text-yellow-300": type === "finish",
      // Yellow rule space
      "bg-yellow-400/25 border-yellow-400/80 text-yellow-300": type === "yellow",
      // Danger zone
      "bg-red-500/30 border-red-500/70 text-red-300 danger-shimmer": type === "danger",
      // Normal space
      "bg-white/8 border-white/15 text-white/50": type === "normal",
      // Active team is here
      "ring-2 ring-white/60 ring-offset-1 ring-offset-transparent": isActive,
    }
  );

  const getIcon = () => {
    if (type === "start")  return "🚀";
    if (type === "finish") return "🏆";
    if (type === "yellow") return "⭐";
    if (type === "danger") return "🔥";
    return null;
  };

  const icon = getIcon();

  return (
    <div className={cellClasses}>
      {/* Position number */}
      <span className="text-[9px] font-bold opacity-50 leading-none absolute top-1 left-1">
        {position}
      </span>

      {/* Icon for special cells */}
      {icon && (
        <span className="text-base leading-none">{icon}</span>
      )}

      {/* Pawns on this cell */}
      {pawns.length > 0 && (
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 p-0.5">
          {pawns.map((pawn, i) => (
            <motion.span
              key={pawn.teamId}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, delay: i * 0.05 }}
              className="text-sm leading-none z-10 drop-shadow-lg"
              title={pawn.teamName}
            >
              {pawn.emoji}
            </motion.span>
          ))}
        </div>
      )}
    </div>
  );
}
