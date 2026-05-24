/**
 * useConfetti — reserved for the winner celebration.
 * Correct-guess bursts are now handled by burstConfetti() called directly
 * in the UI, so this hook is a no-op during normal gameplay.
 */

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useGameStore } from "../store/gameStore";

// Sea-blue party palette
const COLORS = ["#0ea5e9", "#06b6d4", "#0284c7", "#38bdf8", "#f59e0b", "#10b981"];

/** Global hook — mount once in App.jsx. Only fires on the winner screen. */
export function useConfetti() {
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    if (phase !== "winner") return;

    const end = Date.now() + 3500;
    const tick = () => {
      confetti({ particleCount: 5, angle: 60,  spread: 65, origin: { x: 0, y: 0.7 }, colors: COLORS });
      confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1, y: 0.7 }, colors: COLORS });
      if (Date.now() < end) requestAnimationFrame(tick);
    };
    // Big opening burst
    confetti({ particleCount: 120, spread: 160, origin: { x: 0.5, y: 0.55 }, colors: COLORS });
    tick();
  }, [phase]);
}

/**
 * burstConfetti — quick single pop for correct guesses.
 * Intentionally short: one call, no loop.
 */
export function burstConfetti(origin = { x: 0.5, y: 0.65 }) {
  confetti({
    particleCount: 42,
    spread: 75,
    startVelocity: 38,
    scalar: 0.9,
    origin,
    colors: COLORS,
  });
}
