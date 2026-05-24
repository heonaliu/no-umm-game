/**
 * duelStore.js — Zustand store for Duel Mode (1 v 1).
 *
 * Two players alternate as Speaker and Listener each 45-second turn.
 * Speaker: describes word pairs, presses Correct to advance, or skips (limited).
 * Listener: presses DING on filler words / rule violations to gain points.
 *
 * Scoring:
 *   Correct guess  → active Speaker  +1 space
 *   Confirmed DING → Listener        +1 space
 *
 * DING auto-confirms in duel (no separate host review).
 * Skip limit: configurable, default 2 per turn. Resets each turn.
 *
 * Rules: randomly drawn when a player crosses a yellow space (every 5 steps).
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { drawWordPair } from "../data/words";
import { drawRules } from "../data/rules";
import { crossedYellow } from "./boardHelpers";
import { pushDuel, isOnlineMode, generateUniqueDuelCode } from "../lib/duelSync";

export { isYellowSpace, isDangerZone, DANGER_ZONE_SIZE, YELLOW_INTERVAL } from "./boardHelpers";

// ─── Constants ────────────────────────────────────────────────────────────────

export const DUEL_PHASES = {
  LANDING:  "landing",   // triggers navigation back to /
  SETUP:    "setup",
  GAMEPLAY: "gameplay",
  WINNER:   "winner",
};

export const DUEL_TURN_PHASES = {
  IDLE:        "idle",
  DESCRIBING:  "describing",
  DING_REVIEW: "ding_review",   // brief pause showing DING visual before auto-confirming
  TURN_END:    "turn_end",
};

const DEFAULT_BOARD  = 30;
const DEFAULT_TIMER  = 45;
const DEFAULT_SKIPS  = 2;

const DEFAULT_PLAYERS = [
  { id: "p1", name: "Player 1", emoji: "🐉", position: 0, activeRules: [] },
  { id: "p2", name: "Player 2", emoji: "🦊", position: 0, activeRules: [] },
];

const DUEL_SYNC_FIELDS = [
  "phase", "boardLength", "timerSeconds", "skipLimit",
  "players", "activePlayerIndex", "turnPhase",
  "turnStartTime", "timerPausedAt", "timeElapsedBeforePause",
  "currentWordPair", "usedWordPairs", "skipsThisTurn",
  "dingCount", "winnerPlayerId", "teamClaims",
];

// ─── Initial state ─────────────────────────────────────────────────────────────

const initial = {
  phase:       DUEL_PHASES.LANDING,
  roomCode:    null,
  boardLength: DEFAULT_BOARD,
  timerSeconds: DEFAULT_TIMER,
  skipLimit:   DEFAULT_SKIPS,

  players:            [...DEFAULT_PLAYERS.map((p) => ({ ...p, activeRules: [] }))],
  activePlayerIndex:  0,
  teamClaims:         {},

  turnPhase:              DUEL_TURN_PHASES.IDLE,
  turnStartTime:          null,
  timerPausedAt:          null,
  timeElapsedBeforePause: 0,

  currentWordPair: null,
  usedWordPairs:   [],
  skipsThisTurn:   0,

  dingCount:      0,
  winnerPlayerId: null,
};

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useDuelStore = create(
  persist(
    (set, get) => {
      const _publish = () => {
        const s = get();
        if (!s.roomCode || !isOnlineMode) return;
        const slice = {};
        for (const k of DUEL_SYNC_FIELDS) slice[k] = s[k];
        pushDuel(s.roomCode, slice);
      };

      return {
        ...initial,

        // ── Lobby ────────────────────────────────────────────────────────────

        createDuel: async ({ boardLength, timerSeconds, skipLimit, hostDeviceId = null }) => {
          const roomCode   = await generateUniqueDuelCode();
          const players    = DEFAULT_PLAYERS.map((p) => ({ ...p, activeRules: [] }));
          const teamClaims = hostDeviceId ? { "0": hostDeviceId } : {};
          set({
            ...initial,
            phase: DUEL_PHASES.SETUP,
            roomCode, boardLength, timerSeconds, skipLimit,
            players, teamClaims,
          });
          _publish();
          return roomCode;
        },

        joinDuel: (code) => {
          set({ roomCode: code.toUpperCase(), phase: DUEL_PHASES.SETUP });
        },

        // ── Team claims (reuses same pattern as gameStore) ────────────────────

        claimTeamSlot: (teamIndex, deviceId) => {
          if (!deviceId) return;
          const claims = { ...(get().teamClaims ?? {}) };
          for (const k of Object.keys(claims)) {
            if (claims[k] === deviceId) delete claims[k];
          }
          if (teamIndex !== null && teamIndex !== undefined) {
            claims[String(teamIndex)] = deviceId;
          }
          set({ teamClaims: claims });
          _publish();
        },

        releaseTeamSlot: (deviceId) => {
          if (!deviceId) return;
          const claims = { ...(get().teamClaims ?? {}) };
          for (const k of Object.keys(claims)) {
            if (claims[k] === deviceId) delete claims[k];
          }
          set({ teamClaims: claims });
          _publish();
        },

        // ── Player setup ──────────────────────────────────────────────────────

        updatePlayer: (playerId, updates) => {
          set((s) => ({
            players: s.players.map((p) => p.id === playerId ? { ...p, ...updates } : p),
          }));
          _publish();
        },

        // ── Remote sync ───────────────────────────────────────────────────────

        syncFromRemote: (remote) => {
          const { roomCode } = get();
          if (!roomCode) return;
          const patch = {};
          for (const k of DUEL_SYNC_FIELDS) {
            if (remote[k] !== undefined) patch[k] = remote[k];
          }
          set(patch);
        },

        // ── Gameplay ──────────────────────────────────────────────────────────

        startTurn: () => {
          const { usedWordPairs } = get();
          const pair = drawWordPair(usedWordPairs);
          set({
            turnPhase:              DUEL_TURN_PHASES.DESCRIBING,
            currentWordPair:        pair,
            usedWordPairs:          [...usedWordPairs, pair.key],
            turnStartTime:          Date.now(),
            timerPausedAt:          null,
            timeElapsedBeforePause: 0,
            skipsThisTurn:          0,
            dingCount:              get().dingCount, // preserve for sound trigger
          });
          _publish();
        },

        handleTimerExpired: () => {
          if (get().turnPhase !== DUEL_TURN_PHASES.DESCRIBING) return;
          set({ timerPausedAt: Date.now(), turnPhase: DUEL_TURN_PHASES.TURN_END });
          _publish();
        },

        /** Active speaker guessed correctly → speaker +1, draw next word, keep timer running. */
        scoreCorrect: () => {
          const { activePlayerIndex, players, boardLength, usedWordPairs } = get();
          const speaker = players[activePlayerIndex];
          const newPos  = Math.min(speaker.position + 1, boardLength);
          const isWinner = newPos >= boardLength;

          const updatedPlayers = players.map((p, i) => {
            if (i !== activePlayerIndex) return p;
            const u = { ...p, position: newPos };
            // Yellow space → draw a rule for this player
            if (crossedYellow(p.position, newPos)) {
              const existingIds = (u.activeRules ?? []).map((r) => r.id);
              const [rule] = drawRules(1, existingIds);
              if (rule) return { ...u, activeRules: [...(u.activeRules ?? []), rule] };
            }
            return u;
          });

          const newPair = drawWordPair(usedWordPairs);
          set({
            players:         updatedPlayers,
            currentWordPair: isWinner ? get().currentWordPair : newPair,
            usedWordPairs:   isWinner ? usedWordPairs : [...usedWordPairs, newPair.key],
            winnerPlayerId:  isWinner ? speaker.id : null,
            phase:           isWinner ? DUEL_PHASES.WINNER : DUEL_PHASES.GAMEPLAY,
            turnPhase:       isWinner ? DUEL_TURN_PHASES.IDLE : get().turnPhase,
          });
          _publish();
        },

        /** Skip current word — limited by skipLimit per turn. */
        skipWord: () => {
          const { turnPhase, skipLimit, skipsThisTurn, usedWordPairs } = get();
          if (turnPhase !== DUEL_TURN_PHASES.DESCRIBING) return;
          if (skipsThisTurn >= skipLimit) return;
          const newPair = drawWordPair(usedWordPairs);
          set({
            currentWordPair: newPair,
            usedWordPairs:   [...usedWordPairs, newPair.key],
            skipsThisTurn:   skipsThisTurn + 1,
          });
          _publish();
        },

        /**
         * Listener pressed DING.
         * In duel mode DING auto-confirms: listener gets +1 and timer resumes with a new word.
         * We go through DING_REVIEW briefly so the UI can show the bell animation.
         */
        pressDing: () => {
          const { turnPhase, dingCount, turnStartTime, timeElapsedBeforePause } = get();
          if (turnPhase !== DUEL_TURN_PHASES.DESCRIBING) return;
          const now     = Date.now();
          const elapsed = timeElapsedBeforePause + (now - turnStartTime) / 1000;
          set({
            turnPhase:              DUEL_TURN_PHASES.DING_REVIEW,
            timerPausedAt:          now,
            timeElapsedBeforePause: elapsed,
            turnStartTime:          null,
            dingCount:              dingCount + 1,
          });
          _publish();
        },

        /** Auto-called ~800ms after DING_REVIEW: award listener +1 and resume. */
        confirmDing: () => {
          const { activePlayerIndex, players, boardLength, usedWordPairs, timeElapsedBeforePause } = get();
          const listenerIndex = 1 - activePlayerIndex;
          const listener      = players[listenerIndex];
          const newPos        = Math.min(listener.position + 1, boardLength);
          const isWinner      = newPos >= boardLength;

          const updatedPlayers = players.map((p, i) => {
            if (i !== listenerIndex) return p;
            const u = { ...p, position: newPos };
            if (crossedYellow(p.position, newPos)) {
              const existingIds = (u.activeRules ?? []).map((r) => r.id);
              const [rule] = drawRules(1, existingIds);
              if (rule) return { ...u, activeRules: [...(u.activeRules ?? []), rule] };
            }
            return u;
          });

          const newPair = drawWordPair(usedWordPairs);
          const now     = Date.now();

          set({
            players:                updatedPlayers,
            currentWordPair:        isWinner ? get().currentWordPair : newPair,
            usedWordPairs:          isWinner ? usedWordPairs : [...usedWordPairs, newPair.key],
            winnerPlayerId:         isWinner ? listener.id : null,
            phase:                  isWinner ? DUEL_PHASES.WINNER : DUEL_PHASES.GAMEPLAY,
            turnPhase:              isWinner ? DUEL_TURN_PHASES.IDLE : DUEL_TURN_PHASES.DESCRIBING,
            timerPausedAt:          null,
            turnStartTime:          isWinner ? null : now,
            timeElapsedBeforePause: isWinner ? 0 : timeElapsedBeforePause,
          });
          _publish();
        },

        /** Timer ran out — end turn, swap active player. */
        endTurn: () => {
          const { activePlayerIndex, players } = get();
          const next = 1 - activePlayerIndex;
          set({
            activePlayerIndex:      next,
            turnPhase:              DUEL_TURN_PHASES.IDLE,
            currentWordPair:        null,
            turnStartTime:          null,
            timerPausedAt:          null,
            timeElapsedBeforePause: 0,
            skipsThisTurn:          0,
          });
          _publish();
        },

        /** Reset and return to landing → triggers navigate('/') in DuelGameApp. */
        goHome: () => {
          const { roomCode } = get();
          if (roomCode && isOnlineMode) {
            const syncSlice = {};
            for (const k of DUEL_SYNC_FIELDS) syncSlice[k] = initial[k];
            pushDuel(roomCode, syncSlice);
          }
          set({ ...initial });
        },

        /** Play Again: keep players + settings, reset positions. */
        playAgain: () => {
          const { roomCode, boardLength, timerSeconds, skipLimit, players, teamClaims } = get();
          const freshPlayers = players.map((p) => ({
            ...p, position: 0, activeRules: [],
          }));
          set({
            ...initial,
            phase: DUEL_PHASES.SETUP,
            roomCode, boardLength, timerSeconds, skipLimit,
            players: freshPlayers, teamClaims,
          });
          _publish();
        },
      };
    },
    {
      name: "no-umm-duel-v1",
      partialize: (s) => ({
        phase:                  s.phase,
        roomCode:               s.roomCode,
        boardLength:            s.boardLength,
        timerSeconds:           s.timerSeconds,
        skipLimit:              s.skipLimit,
        players:                s.players,
        activePlayerIndex:      s.activePlayerIndex,
        turnPhase:              s.turnPhase,
        turnStartTime:          s.turnStartTime,
        timerPausedAt:          s.timerPausedAt,
        timeElapsedBeforePause: s.timeElapsedBeforePause,
        currentWordPair:        s.currentWordPair,
        usedWordPairs:          s.usedWordPairs,
        winnerPlayerId:         s.winnerPlayerId,
        teamClaims:             s.teamClaims,
      }),
    }
  )
);

export { DEFAULT_BOARD as DEFAULT_DUEL_BOARD, DEFAULT_TIMER as DEFAULT_DUEL_TIMER, DEFAULT_SKIPS as DEFAULT_DUEL_SKIPS };
