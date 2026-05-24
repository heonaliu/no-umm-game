/**
 * DeviceContext — persists per-device identity in localStorage so that
 * after a page refresh the player returns to their team view.
 *
 * Shape:
 *   myTeamIndex  — which team slot this device represents (null = not joined)
 *   isHost       — was this device the room creator?
 *
 * This is intentionally NOT in Zustand (it must survive game resets).
 */

import { createContext, useContext, useState, useEffect } from "react";

const Ctx = createContext({
  myTeamIndex: null,
  isHost: false,
  claimTeam: () => {},
  clearDevice: () => {},
});

const LS_KEY = "no-umm-device";

export function DeviceProvider({ children }) {
  const [myTeamIndex, setMyTeamIndex] = useState(null);
  const [isHost, setIsHost] = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setMyTeamIndex(saved.myTeamIndex ?? null);
        setIsHost(saved.isHost ?? false);
      }
    } catch {}
  }, []);

  const claimTeam = (teamIndex, host = false) => {
    setMyTeamIndex(teamIndex);
    setIsHost(host);
    localStorage.setItem(LS_KEY, JSON.stringify({ myTeamIndex: teamIndex, isHost: host }));
  };

  const clearDevice = () => {
    setMyTeamIndex(null);
    setIsHost(false);
    localStorage.removeItem(LS_KEY);
  };

  return (
    <Ctx.Provider value={{ myTeamIndex, isHost, claimTeam, clearDevice }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDevice() {
  return useContext(Ctx);
}
