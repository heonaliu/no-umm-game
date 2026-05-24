/**
 * useConfetti — triggers canvas-confetti bursts when confettiTrigger changes.
 */

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useGameStore } from "../store/gameStore";

export function useConfetti() {
  const trigger = useGameStore((s) => s.confettiTrigger);

  useEffect(() => {
    if (trigger === 0) return;

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [trigger]);
}

/**
 * Trigger a quick single-burst confetti (can be called imperatively)
 */
export function burstConfetti(origin = { x: 0.5, y: 0.7 }) {
  confetti({
    particleCount: 80,
    spread: 100,
    origin,
    colors: ["#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#10b981"],
  });
}
