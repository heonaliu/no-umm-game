/**
 * CountdownTimer — SVG ring timer driven by useGameTimer().
 * Works identically on every device in the room (timestamp-based).
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGameTimer } from "../../hooks/useGameTimer";
import { useGameStore } from "../../store/gameStore";
import clsx from "clsx";

export function CountdownTimer({ large = false }) {
  const remaining    = useGameTimer();
  const timerSeconds = useGameStore((s) => s.timerSeconds);

  const progress  = timerSeconds > 0 ? remaining / timerSeconds : 0;
  const isUrgent  = progress <= 0.25;
  const isWarning = progress <= 0.5 && !isUrgent;

  const size = large ? 140 : 96;
  const cx   = size / 2;
  const r    = cx - 8;
  const circ = 2 * Math.PI * r;
  const sw   = large ? 10 : 7;

  const strokeColor = useMemo(() => {
    if (progress > 0.5) return "#059669";   // emerald
    if (progress > 0.25) return "#d97706";  // amber
    return "#dc2626";                        // red
  }, [progress]);

  return (
    <div className={clsx("relative inline-flex items-center justify-center shrink-0", large ? "w-36 h-36" : "w-24 h-24")}>
      <svg
        width={size}
        height={size}
        className={clsx("-rotate-90", isUrgent && "animate-pulse")}
      >
        {/* Track */}
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e0e7ff" strokeWidth={sw} />
        {/* Arc */}
        <motion.circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ * (1 - progress) }}
          transition={{ duration: 0.9, ease: "linear" }}
          style={{ filter: `drop-shadow(0 0 ${large ? 8 : 5}px ${strokeColor}60)` }}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={remaining}
          initial={{ scale: 1.2, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className={clsx(
            "font-display font-bold leading-none",
            large ? "text-4xl" : "text-2xl",
            isUrgent ? "text-red-600" : isWarning ? "text-amber-600" : "text-indigo-700"
          )}
        >
          {remaining}
        </motion.span>
      </div>
    </div>
  );
}
