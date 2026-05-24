import clsx from "clsx";

const colors = {
  sky:     "bg-sky-100 text-sky-700 border-sky-200",
  cyan:    "bg-cyan-100 text-cyan-700 border-cyan-200",
  blue:    "bg-blue-100 text-blue-700 border-blue-200",
  amber:   "bg-amber-100 text-amber-700 border-amber-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  red:     "bg-red-100 text-red-700 border-red-200",
  gray:    "bg-gray-100 text-gray-600 border-gray-200",
  yellow:  "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export function Badge({ children, color = "sky", className = "" }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border", colors[color] ?? colors.sky, className)}>
      {children}
    </span>
  );
}
