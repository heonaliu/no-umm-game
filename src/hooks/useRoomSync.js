/**
 * useRoomSync — subscribes to the Firebase room and applies remote state.
 *
 * Mount this once near the top of the app (in App.jsx).
 * It is a no-op in local mode (no Firebase env vars).
 */

import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { subscribeRoom, isOnlineMode } from "../lib/roomSync";

export function useRoomSync() {
  const roomCode      = useGameStore((s) => s.roomCode);
  const syncFromRemote = useGameStore((s) => s.syncFromRemote);

  useEffect(() => {
    if (!roomCode || !isOnlineMode) return;
    const unsub = subscribeRoom(roomCode, (remoteState) => {
      syncFromRemote(remoteState);
    });
    return unsub;
  }, [roomCode, syncFromRemote]);
}
