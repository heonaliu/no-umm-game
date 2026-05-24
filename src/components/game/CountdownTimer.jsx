/**
 * CountdownTimer — circular SVG timer with color transitions.
 * Green → Yellow → Red as time runs low.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../../store/gameStore";
import clsx from "clsx";

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CountdownTimer({ large = false }) {
  const timerRemaining = useGameStore((s) => s.timerRemaining);
  const timerSeconds = useGameStore((s) => s.timerSeconds);
  const timerActive = useGameStore((s) => s.timerActive);

  const progress = timerSeconds > 0 ? timerRemaining / timerSeconds : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  // Color based on time remaining
  const color = useMemo(() => {
    if (progress > 0.5) return "#10b981"; // green
    if (progress > 0.25) return "#f59e0b"; // yellow
    return "#ef4444"; // red
  }, [progress]);

  const isUrgent = progress <= 0.25;
  const size = large ? 140 : 100;
  const cx = size / 2;
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - progress);

  return (
    <div className={clsx("relative inline-flex items-center justify-center", large ? "w-36 h-36" : "w-24 h-24")}>
      <svg
        width={size}
        height={size}
        className={clsx("-rotate-90", isUrgent && timerActive && "animate-pulse")}
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={large ? 10 : 8}
        />
        {/* Progress arc */}
        <motion.circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={large ? 10 : 8}
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "linear" }}
          style={{
            filter: `drop-shadow(0 0 ${large ? 10 : 6}px ${color})`,
          }}
        />
      </svg>

      {/* Center number */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={timerRemaining}
          initial={{ scale: 1.3, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className={clsx(
            "font-display font-bold leading-none",
            large ? "text-4xl" : "text-2xl",
            isUrgent ? "text-red-400" : "text-white"
          )}
        >
          {timerRemaining}
        </motion.span>
      </div>
    </div>
  );
}
