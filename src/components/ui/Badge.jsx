/** Badge — small pill label for rules, status, etc. */

import clsx from "clsx";

const colors = {
  indigo:   "bg-indigo-100 text-indigo-700 border-indigo-200",
  violet:   "bg-violet-100 text-violet-700 border-violet-200",
  amber:    "bg-amber-100  text-amber-700  border-amber-200",
  emerald:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  red:      "bg-red-100 text-red-700 border-red-200",
  cyan:     "bg-cyan-100 text-cyan-700 border-cyan-200",
  pink:     "bg-pink-100 text-pink-700 border-pink-200",
  gray:     "bg-gray-100 text-gray-600 border-gray-200",
};

export function Badge({ children, color = "indigo", className = "" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border",
        colors[color] ?? colors.indigo,
        className
      )}
    >
      {children}
    </span>
  );
}
