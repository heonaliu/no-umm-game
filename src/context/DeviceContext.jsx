/**
 * DeviceContext — persists per-device identity in localStorage so that
 * after a page refresh the player returns to their team view.
 *
 * Shape:
 *   deviceId     — stable UUID for this browser (never changes)
 *   myTeamIndex  — which team slot this device represents (null = not claimed)
 *   isHost       — was this device the room creator?
 *
 * deviceId is intentionally separate from myTeamIndex so it survives
 * game resets and is used to lock team slots in Firebase.
 */

import { createContext, useContext, useState, useEffect } from "react";

const Ctx = createContext({
  deviceId: null,
  myTeamIndex: null,
  isHost: false,
  claimTeam: () => {},
  clearDevice: () => {},
});

const LS_KEY    = "no-umm-device";
const LS_ID_KEY = "no-umm-device-id";

function getOrCreateDeviceId() {
  try {
    let id = localStorage.getItem(LS_ID_KEY);
    if (!id) {
      // Compact random ID — enough entropy for a party game
      id = "d-" + Math.random().toString(36).slice(2, 10) +
               Math.random().toString(36).slice(2, 6);
      localStorage.setItem(LS_ID_KEY, id);
    }
    return id;
  } catch {
    return "d-fallback";
  }
}

export function DeviceProvider({ children }) {
  const [deviceId,     setDeviceId]     = useState(null);
  const [myTeamIndex,  setMyTeamIndex]  = useState(null);
  const [isHost,       setIsHost]       = useState(false);

  // Restore from localStorage on mount
  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
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
    // Note: we intentionally keep the deviceId in localStorage so the
    // same browser always uses the same ID across sessions.
  };

  return (
    <Ctx.Provider value={{ deviceId, myTeamIndex, isHost, claimTeam, clearDevice }}>
      {children}
    </Ctx.Provider>
  );
}

export function useDevice() {
  return useContext(Ctx);
}
