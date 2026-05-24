/**
 * firebase.js — Firebase initialization.
 *
 * The app runs in one of two modes:
 *   • Online mode  — Firebase env vars are set → real cross-device multiplayer
 *   • Local mode   — No env vars → single-device pass-and-play (still fully functional)
 *
 * Check `isOnlineMode` anywhere to branch behavior.
 */

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const config = {
  apiKey:      import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId:   import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:       import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only online if ALL required vars are present
export const isOnlineMode = Boolean(
  config.apiKey && config.databaseURL && config.projectId && config.appId
);

let _db = null;

if (isOnlineMode) {
  try {
    const app = initializeApp(config);
    _db = getDatabase(app);
  } catch (err) {
    console.warn("[Firebase] Init failed:", err.message);
  }
}

export const db = _db;
