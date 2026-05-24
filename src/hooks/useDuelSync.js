/**
 * useDuelSync — subscribes to Firebase duel room and applies remote state.
 * Mount once inside DuelGameApp. No-op in local mode.
 */

import { useEffect } from "react";
import { useDuelStore } from "../store/duelStore";
import { subscribeDuel, isOnlineMode } from "../lib/duelSync";

export function useDuelSync() {
  const roomCode       = useDuelStore((s) => s.roomCode);
  const syncFromRemote = useDuelStore((s) => s.syncFromRemote);

  useEffect(() => {
    if (!roomCode || !isOnlineMode) return;
    const unsub = subscribeDuel(roomCode, (remote) => {
      syncFromRemote(remote);
    });
    return unsub;
  }, [roomCode, syncFromRemote]);
}
