/**
 * duelSync.js — Firebase adapter for Duel Mode rooms.
 *
 * Duel rooms live under `duels/{roomCode}` (separate namespace from team `rooms/`).
 * API mirrors roomSync.js so the two modes are fully independent.
 */

import { db, isOnlineMode } from "./firebase";
import { ref, set, onValue, off, get as fbGet } from "firebase/database";
import { generateRoomCode } from "../data/teams";

const DUEL_ARRAY_FIELDS = ["players", "usedWordPairs"];

export function serialiseDuel(state) {
  const out = { ...state };
  for (const f of DUEL_ARRAY_FIELDS) {
    if (out[f] !== undefined) out[f] = JSON.stringify(out[f] ?? []);
  }
  return out;
}

export function deserialiseDuel(raw) {
  if (!raw) return null;
  const out = { ...raw };
  for (const f of DUEL_ARRAY_FIELDS) {
    if (typeof out[f] === "string") {
      try { out[f] = JSON.parse(out[f]); }
      catch { out[f] = []; }
    }
  }
  return out;
}

/** Subscribe to a duel room. Returns an unsubscribe fn. */
export function subscribeDuel(roomCode, callback) {
  if (!isOnlineMode || !db) return () => {};
  const r = ref(db, `duels/${roomCode}`);
  onValue(r, (snap) => {
    const data = deserialiseDuel(snap.val());
    if (data) callback(data);
  });
  return () => off(r);
}

/** Overwrite entire duel state in Firebase. */
export async function pushDuel(roomCode, state) {
  if (!isOnlineMode || !db) return;
  const r = ref(db, `duels/${roomCode}`);
  await set(r, serialiseDuel(state)).catch((e) =>
    console.warn("[duelSync] write failed:", e.message)
  );
}

/** One-time check: does a duel room exist? */
export async function duelExists(roomCode) {
  if (!isOnlineMode || !db) return false;
  try {
    const snap = await fbGet(ref(db, `duels/${roomCode}`));
    return snap.exists();
  } catch {
    return false;
  }
}

/** Generate a 4-char code not already used as a duel room. */
export async function generateUniqueDuelCode() {
  if (!isOnlineMode || !db) return generateRoomCode();
  for (let i = 0; i < 10; i++) {
    const code = generateRoomCode();
    if (!(await duelExists(code))) return code;
  }
  return generateRoomCode();
}

export { isOnlineMode };
