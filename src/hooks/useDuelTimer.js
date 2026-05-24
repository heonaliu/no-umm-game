/**
 * useDuelTimer — mirrors useGameTimer but reads from duelStore.
 *
 * Returns integer seconds remaining. Fires duelStore.handleTimerExpired()
 * when it hits 0 (same pattern as useGameTimer).
 */

import { useState, useEffect } from "react";
import { useDuelStore, DUEL_TURN_PHASES } from "../store/duelStore";

export function useDuelTimer() {
  const turnPhase            = useDuelStore((s) => s.turnPhase);
  const turnStartTime        = useDuelStore((s) => s.turnStartTime);
  const timerPausedAt        = useDuelStore((s) => s.timerPausedAt);
  const elapsedBefore        = useDuelStore((s) => s.timeElapsedBeforePause);
  const timerSeconds         = useDuelStore((s) => s.timerSeconds);
  const handleTimerExpired   = useDuelStore((s) => s.handleTimerExpired);

  const [display, setDisplay] = useState(timerSeconds);

  useEffect(() => {
    if (turnPhase !== DUEL_TURN_PHASES.DESCRIBING || !turnStartTime) {
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

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [turnPhase, turnStartTime, timerPausedAt, elapsedBefore, timerSeconds, handleTimerExpired]);

  return display;
}
