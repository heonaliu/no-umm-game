/**
 * BoardCell — single space on the board.
 * Types: normal | yellow | danger | start | finish
 */

import { motion } from "framer-motion";
import { Star, Flame, Trophy, Rocket } from "lucide-react";
import clsx from "clsx";

function CellIcon({ type }) {
  if (type === "start")  return <Rocket  size={14} className="text-emerald-600" />;
  if (type === "finish") return <Trophy  size={14} className="text-amber-600" />;
  if (type === "yellow") return <Star    size={14} className="text-amber-500 fill-amber-400" />;
  if (type === "danger") return <Flame   size={14} className="text-red-500" />;
  return null;
}

export function BoardCell({ position, type, pawns = [], isActive = false }) {
  return (
    <div
      className={clsx(
        "relative flex flex-col items-center justify-center rounded-xl border-2 transition-all",
        "min-w-[44px] min-h-[44px] w-11 h-11 shrink-0",
        type === "start"  && "bg-emerald-50 border-emerald-300",
        type === "finish" && "bg-amber-50 border-amber-400",
        type === "yellow" && "bg-amber-50 border-amber-300",
        type === "danger" && "bg-red-50 border-red-300 danger-shimmer",
        type === "normal" && "bg-indigo-50/80 border-indigo-100",
        isActive && "ring-2 ring-indigo-400 ring-offset-1 ring-offset-white",
      )}
    >
      <span className="absolute top-0.5 left-1 text-[8px] font-bold text-indigo-300 leading-none">
        {position}
      </span>

      <CellIcon type={type} />

      {/* Pawns */}
      {pawns.length > 0 && (
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 p-0.5">
          {pawns.map((pawn, i) => (
            <motion.span
              key={pawn.teamId}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, delay: i * 0.05 }}
              className="text-sm leading-none z-10 drop-shadow-sm"
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
