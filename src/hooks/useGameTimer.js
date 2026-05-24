/**
 * useGameTimer — computes remaining seconds from Firebase-safe timestamps.
 *
 * Because `turnStartTime` is a Date.now() epoch stored in Firebase,
 * ALL devices independently calculate the same remaining value —
 * no single "timer master" device is needed.
 *
 * Returns the integer seconds remaining (never below 0).
 */

import { useState, useEffect } from "react";
import { useGameStore, TURN_PHASES } from "../store/gameStore";

export function useGameTimer() {
  const turnPhase            = useGameStore((s) => s.turnPhase);
  const turnStartTime        = useGameStore((s) => s.turnStartTime);
  const timerPausedAt        = useGameStore((s) => s.timerPausedAt);
  const elapsedBefore        = useGameStore((s) => s.timeElapsedBeforePause);
  const timerSeconds         = useGameStore((s) => s.timerSeconds);
  const handleTimerExpired   = useGameStore((s) => s.handleTimerExpired);

  const [display, setDisplay] = useState(timerSeconds);

  useEffect(() => {
    // If paused or not in describing phase, compute once from stored values
    if (turnPhase !== TURN_PHASES.DESCRIBING || !turnStartTime) {
      if (timerPausedAt && turnStartTime) {
        const elapsed = elapsedBefore + (timerPausedAt - turnStartTime) / 1000;
        setDisplay(Math.max(0, Math.ceil(timerSeconds - elapsed)));
      } else {
        setDisplay(timerSeconds);
      }
      return;
    }

    const tick = () => {
      const now     = Date.now();
      const elapsed = elapsedBefore + (now - turnStartTime) / 1000;
      const rem     = Math.max(0, Math.ceil(timerSeconds - elapsed));
      setDisplay(rem);
      if (rem <= 0) handleTimerExpired();
    };

    tick(); // immediate update
    const id = setInterval(tick, 250); // smooth updates
    return () => clearInterval(id);
  }, [turnPhase, turnStartTime, timerPausedAt, elapsedBefore, timerSeconds, handleTimerExpired]);

  return display;
}
