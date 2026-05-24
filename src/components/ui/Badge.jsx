/**
 * Badge — small pill label for rules, status indicators, etc.
 */

import clsx from "clsx";

const colors = {
  violet:  "bg-violet-500/20 text-violet-300 border-violet-500/40",
  pink:    "bg-pink-500/20 text-pink-300 border-pink-500/40",
  cyan:    "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  amber:   "bg-amber-500/20 text-amber-300 border-amber-500/40",
  green:   "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  red:     "bg-red-500/20 text-red-300 border-red-500/40",
  white:   "bg-white/10 text-white/80 border-white/20",
  yellow:  "bg-yellow-400/20 text-yellow-300 border-yellow-400/40",
};

export function Badge({ children, color = "white", className = "" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border",
        colors[color] ?? colors.white,
        className
      )}
    >
      {children}
    </span>
  );
}
