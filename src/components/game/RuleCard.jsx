/**
 * RuleCard — displays a single rule card.
 * Used in drafting (selectable) and active rules panel (read-only).
 */

import { motion } from "framer-motion";
import { Check, Shield } from "lucide-react";
import clsx from "clsx";

const difficultyStyle = {
  easy:   { wrap: "bg-emerald-50 border-emerald-200", badge: "text-emerald-600 bg-emerald-100" },
  medium: { wrap: "bg-amber-50  border-amber-200",   badge: "text-amber-600   bg-amber-100"   },
  hard:   { wrap: "bg-red-50    border-red-200",     badge: "text-red-600     bg-red-100"     },
};

export function RuleCard({
  rule,
  selected = false,
  onToggle,
  compact = false,
  animateIn = false,
  delay = 0,
}) {
  const ds = difficultyStyle[rule.difficulty] ?? difficultyStyle.medium;

  const card = (
    <div
      onClick={onToggle ? () => onToggle(rule.id) : undefined}
      className={clsx(
        "rounded-2xl border-2 relative overflow-hidden transition-all duration-200",
        compact ? "p-3" : "p-4",
        ds.wrap,
        onToggle && "cursor-pointer hover:brightness-105 select-none",
        selected && "ring-2 ring-sky-400 ring-offset-2 border-sky-400 brightness-105",
      )}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center"
        >
          <Check size={12} strokeWidth={3} className="text-white" />
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        <div className="shrink-0 w-8 h-8 rounded-xl bg-white border border-current/10 flex items-center justify-center">
          <Shield size={16} className="text-sky-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={clsx("font-display text-sky-900", compact ? "text-sm" : "text-base")}>
            {rule.title}
          </h3>
          {!compact && (
            <p className="text-sky-600/70 text-sm mt-0.5 leading-snug">{rule.description}</p>
          )}
          <span className={clsx("text-[10px] font-bold uppercase tracking-widest mt-1 inline-block px-1.5 py-0.5 rounded-full", ds.badge)}>
            {rule.difficulty}
          </span>
        </div>
      </div>
    </div>
  );

  if (animateIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: "spring", stiffness: 300 }}
      >
        {card}
      </motion.div>
    );
  }

  return card;
}
