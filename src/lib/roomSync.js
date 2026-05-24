/**
 * roomSync.js — thin Firebase Realtime Database adapter.
 *
 * All game state is written as one flat object under rooms/{code}.
 * Arrays are serialised as JSON strings to avoid Firebase's
 * array→object key coercion.
 *
 * Architecture note: replacing `db` with any other real-time primitive
 * (Supabase, Ably, PartyKit…) only requires changes in this file.
 */

import { db, isOnlineMode } from "./firebase";
import { ref, set, onValue, off } from "firebase/database";

// ─── Serialise / deserialise ──────────────────────────────────────────────────

/** Fields that are plain arrays and need JSON round-tripping. */
const ARRAY_FIELDS = ["teams", "usedWordPairs", "activeRules", "turnLog"];

export function serialiseRoom(state) {
  const out = { ...state };
  for (const field of ARRAY_FIELDS) {
    if (out[field] !== undefined) {
      out[field] = JSON.stringify(out[field] ?? []);
    }
  }
  return out;
}

export function deserialiseRoom(raw) {
  if (!raw) return null;
  const out = { ...raw };
  for (const field of ARRAY_FIELDS) {
    if (typeof out[field] === "string") {
      try { out[field] = JSON.parse(out[field]); }
      catch { out[field] = []; }
    }
  }
  return out;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Subscribe to a room. Returns an unsubscribe function.
 * `callback` receives the full deserialised game state.
 */
export function subscribeRoom(roomCode, callback) {
  if (!isOnlineMode || !db) return () => {};
  const r = ref(db, `rooms/${roomCode}`);
  onValue(r, (snap) => {
    const data = deserialiseRoom(snap.val());
    if (data) callback(data);
  });
  return () => off(r);
}

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Overwrite the entire room state in Firebase.
 * `state` is the plain Zustand slice that should be persisted.
 */
export async function pushRoom(roomCode, state) {
  if (!isOnlineMode || !db) return;
  const r = ref(db, `rooms/${roomCode}`);
  await set(r, serialiseRoom(state)).catch((e) =>
    console.warn("[roomSync] write failed:", e.message)
  );
}

/** Convenience: only call pushRoom when Firebase is active. */
export { isOnlineMode };
