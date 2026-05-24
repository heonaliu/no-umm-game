/**
 * useTimer — drives the countdown timer for each turn.
 * Reads timerActive / timerRemaining from the store and
 * calls tickTimer() once per second while active.
 */

import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";

export function useTimer() {
  const timerActive = useGameStore((s) => s.timerActive);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [timerActive, tickTimer]);
}
