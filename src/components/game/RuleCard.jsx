/**
 * RuleCard — displays a single rule card.
 * Used in drafting, active rules panel, and rule reveal.
 */

import { motion } from "framer-motion";
import clsx from "clsx";

const difficultyColors = {
  easy:   { bg: "bg-emerald-500/15 border-emerald-500/40", text: "text-emerald-400" },
  medium: { bg: "bg-amber-500/15 border-amber-500/40",     text: "text-amber-400"   },
  hard:   { bg: "bg-red-500/15 border-red-500/40",         text: "text-red-400"     },
};

export function RuleCard({
  rule,
  selected = false,
  onToggle,
  compact = false,
  animateIn = false,
  delay = 0,
}) {
  const dc = difficultyColors[rule.difficulty] ?? difficultyColors.medium;

  const card = (
    <div
      onClick={onToggle ? () => onToggle(rule.id) : undefined}
      className={clsx(
        "rounded-2xl border-2 transition-all duration-200 relative overflow-hidden",
        compact ? "p-3" : "p-4",
        dc.bg,
        onToggle && "cursor-pointer hover:brightness-110 select-none",
        selected
          ? "ring-2 ring-violet-400 ring-offset-2 ring-offset-transparent border-violet-400 brightness-125"
          : "border-transparent",
      )}
    >
      {/* Selected checkmark */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-xs font-bold text-white"
        >
          ✓
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        <span className={clsx("text-2xl", compact && "text-xl")}>{rule.emoji}</span>
        <div>
          <h3 className={clsx("font-display text-white font-bold", compact ? "text-sm" : "text-base")}>
            {rule.title}
          </h3>
          {!compact && (
            <p className="text-white/60 text-sm mt-1 leading-snug">{rule.description}</p>
          )}
          <span className={clsx("text-xs font-bold uppercase tracking-widest mt-1.5 inline-block", dc.text)}>
            {rule.difficulty}
          </span>
        </div>
      </div>
    </div>
  );

  if (animateIn) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, type: "spring", stiffness: 300 }}
      >
        {card}
      </motion.div>
    );
  }

  return card;
}
