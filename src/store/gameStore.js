/**
 * gameStore.js — Zustand store for all game state.
 *
 * Timer strategy:
 *   Rather than a countdown stored in state (which breaks across devices),
 *   we store `turnStartTime` (epoch ms) and `timerPausedAt`.
 *   Every device independently computes remaining time via useGameTimer().
 *
 * Multiplayer strategy:
 *   After every mutating action, `_publish()` writes the shareable slice
 *   to Firebase when online mode is active.  When Firebase pushes an update
 *   from another device, `syncFromRemote()` applies it locally.
 *   In local mode (no Firebase) everything is purely in-memory + localStorage.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateDefaultTeams, generateRoomCode } from "../data/teams";
import { drawRules } from "../data/rules";
import { drawWordPair } from "../data/words";
import { pushRoom, isOnlineMode } from "../lib/roomSync";
import { crossedYellow, YELLOW_INTERVAL } from "./boardHelpers";

export { isYellowSpace, isDangerZone, DANGER_ZONE_SIZE, YELLOW_INTERVAL } from "./boardHelpers";

// ─── Constants ────────────────────────────────────────────────────────────────

export const GAME_PHASES = {
  LANDING:    "landing",
  LOBBY:      "lobby",
  TEAM_SETUP: "team_setup",
  RULE_DRAFT: "rule_draft",
  GAMEPLAY:   "gameplay",
  WINNER:     "winner",
};

export const TURN_PHASES = {
  IDLE:        "idle",
  DESCRIBING:  "describing",
  DING_REVIEW: "ding_review",
  TURN_END:    "turn_end",
};

const DEFAULT_BOARD  = 30;
const DEFAULT_TIMER  = 45;

// ─── Fields that are synced to Firebase ───────────────────────────────────────

const SYNC_FIELDS = [
  "phase", "numTeams", "boardLength", "timerSeconds",
  "teams", "currentTeamIndex", "turnPhase",
  "turnStartTime", "timerPausedAt", "timeElapsedBeforePause",
  "currentWordPair", "usedWordPairs",
  "dingTeamIndex", "activeRules", "turnLog",
  "winnerTeamId", "ruleDraftComplete",
];

// ─── Initial state ────────────────────────────────────────────────────────────

const initial = {
  phase: GAME_PHASES.LANDING,
  roomCode: null,

  numTeams:     2,
  boardLength:  DEFAULT_BOARD,
  timerSeconds: DEFAULT_TIMER,

  teams: [],
  ruleDraftComplete: false,

  currentTeamIndex: 0,
  turnPhase: TURN_PHASES.IDLE,

  // Timestamp-based timer (works across devices)
  turnStartTime: null,             // Date.now() when describing started (or resumed)
  timerPausedAt: null,             // Date.now() when timer paused (ding/end)
  timeElapsedBeforePause: 0,       // cumulative seconds already used before current start

  currentWordPair: null,
  usedWordPairs: [],
  dingTeamIndex: null,
  activeRules: [],
  turnLog: [],
  winnerTeamId: null,
  confettiTrigger: 0,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create(
  persist(
    (set, get) => {
      /** Write the sync slice to Firebase (no-op in local mode). */
      const _publish = () => {
        const s = get();
        if (!s.roomCode || !isOnlineMode) return;
        const slice = {};
        for (const k of SYNC_FIELDS) slice[k] = s[k];
        pushRoom(s.roomCode, slice);
      };

      return {
        ...initial,

        // ── Phase navigation ───────────────────────────────────────────────

        setPhase: (phase) => { set({ phase }); _publish(); },

        goToLanding: () => set({ ...initial }),

        // ── Lobby ──────────────────────────────────────────────────────────

        createRoom: ({ numTeams, boardLength, timerSeconds }) => {
          const roomCode = generateRoomCode();
          const teams    = generateDefaultTeams(numTeams);
          set({
            roomCode, numTeams, boardLength, timerSeconds,
            teams,
            phase: GAME_PHASES.TEAM_SETUP,
            ...resetTurnState(),
          });
          _publish();
          return roomCode;
        },

        joinRoom: (code) => {
          // In online mode the useRoomSync hook will overwrite state from Firebase.
          set({ roomCode: code.toUpperCase(), phase: GAME_PHASES.TEAM_SETUP });
        },

        // ── Syncing from remote (Firebase listener) ────────────────────────

        syncFromRemote: (remote) => {
          const { roomCode } = get();
          // Only apply remote updates if we're in the same room
          if (!roomCode) return;
          const patch = {};
          for (const k of SYNC_FIELDS) {
            if (remote[k] !== undefined) patch[k] = remote[k];
          }
          set(patch);
        },

        // ── Team setup ─────────────────────────────────────────────────────

        updateTeam: (teamId, updates) => {
          set((s) => ({
            teams: s.teams.map((t) => t.id === teamId ? { ...t, ...updates } : t),
          }));
          _publish();
        },

        // ── Rule draft ─────────────────────────────────────────────────────

        dealRuleCards: () => {
          const { teams } = get();
          const usedIds = [];
          const updated = teams.map((team) => {
            const cards = drawRules(6, usedIds);
            cards.forEach((c) => usedIds.push(c.id));
            return { ...team, ruleCards: cards, selectedDraftCards: [] };
          });
          set({ teams: updated, phase: GAME_PHASES.RULE_DRAFT });
          _publish();
        },

        toggleDraftCard: (teamId, ruleId) => {
          set((s) => ({
            teams: s.teams.map((t) => {
              if (t.id !== teamId) return t;
              const has = t.selectedDraftCards?.includes(ruleId);
              if (has) return { ...t, selectedDraftCards: t.selectedDraftCards.filter((id) => id !== ruleId) };
              if ((t.selectedDraftCards?.length ?? 0) >= 3) return t;
              return { ...t, selectedDraftCards: [...(t.selectedDraftCards ?? []), ruleId] };
            }),
          }));
          _publish();
        },

        finalizeDraft: () => {
          const { teams } = get();
          const n = teams.length;
          const updated = teams.map((team, i) => {
            const giver    = teams[(i - 1 + n) % n];
            const incoming = (giver.ruleCards ?? []).filter((r) =>
              (giver.selectedDraftCards ?? []).includes(r.id)
            );
            return { ...team, ruleCards: [], selectedDraftCards: [], pendingRules: incoming, activeRules: [] };
          });
          set({ teams: updated, ruleDraftComplete: true, phase: GAME_PHASES.GAMEPLAY });
          _publish();
        },

        // ── Gameplay ───────────────────────────────────────────────────────

        startTurn: () => {
          const { usedWordPairs } = get();
          const pair = drawWordPair(usedWordPairs);
          const now  = Date.now();
          set({
            turnPhase: TURN_PHASES.DESCRIBING,
            currentWordPair: pair,
            usedWordPairs: [...usedWordPairs, pair.key],
            turnStartTime: now,
            timerPausedAt: null,
            timeElapsedBeforePause: 0,
            turnLog: [],
            dingTeamIndex: null,
          });
          _publish();
        },

        /** Called when the local timer hook detects expiry. */
        handleTimerExpired: () => {
          const { turnPhase } = get();
          if (turnPhase !== TURN_PHASES.DESCRIBING) return;
          const now = Date.now();
          set({ timerPausedAt: now, turnPhase: TURN_PHASES.TURN_END });
          _publish();
        },

        scoreCorrect: () => {
          const { currentTeamIndex, teams, boardLength, usedWordPairs, currentWordPair } = get();
          const team     = teams[currentTeamIndex];
          const newPos   = Math.min(team.position + 1, boardLength);
          const isWinner = newPos >= boardLength;

          // Check if we crossed a yellow space and should activate a pending rule
          let activatedRule = null;
          const updatedTeams = teams.map((t, i) => {
            if (i !== currentTeamIndex) return t;
            const u = { ...t, position: newPos };
            if (crossedYellow(t.position, newPos) && (u.pendingRules?.length ?? 0) > 0) {
              activatedRule = u.pendingRules[0];
              return { ...u, activeRules: [...(u.activeRules ?? []), activatedRule], pendingRules: u.pendingRules.slice(1) };
            }
            return u;
          });

          const newPair = drawWordPair([...usedWordPairs]);
          const log = [...get().turnLog, { type: "correct", teamId: team.id, word: currentWordPair }];

          set({
            teams: updatedTeams,
            currentWordPair: newPair,
            usedWordPairs: [...usedWordPairs, newPair.key],
            turnLog: log,
            winnerTeamId: isWinner ? team.id : null,
            phase: isWinner ? GAME_PHASES.WINNER : GAME_PHASES.GAMEPLAY,
            confettiTrigger: get().confettiTrigger + 1,
          });
          _publish();
        },

        pressDing: (dingTeamIndex) => {
          const { turnPhase } = get();
          if (turnPhase !== TURN_PHASES.DESCRIBING) return;
          const now = Date.now();
          const elapsed = get().timeElapsedBeforePause + (now - get().turnStartTime) / 1000;
          set({
            dingTeamIndex,
            timerPausedAt: now,
            timeElapsedBeforePause: elapsed,
            turnStartTime: null,
            turnPhase: TURN_PHASES.DING_REVIEW,
          });
          _publish();
        },

        confirmDing: () => {
          const { dingTeamIndex, teams, boardLength } = get();
          if (dingTeamIndex === null) return;

          const dingTeam = teams[dingTeamIndex];
          const newPos   = Math.min(dingTeam.position + 1, boardLength);
          const isWinner = newPos >= boardLength;

          const updatedTeams = teams.map((t, i) =>
            i === dingTeamIndex ? { ...t, position: newPos } : t
          );

          // Resume timer: reset start time based on remaining elapsed
          const now = Date.now();
          const newPair = drawWordPair(get().usedWordPairs);

          set({
            teams: updatedTeams,
            dingTeamIndex: null,
            timerPausedAt: null,
            turnStartTime: isWinner ? null : now,
            currentWordPair: isWinner ? get().currentWordPair : newPair,
            usedWordPairs: isWinner ? get().usedWordPairs : [...get().usedWordPairs, newPair.key],
            turnPhase: isWinner ? TURN_PHASES.IDLE : TURN_PHASES.DESCRIBING,
            winnerTeamId: isWinner ? dingTeam.id : null,
            phase: isWinner ? GAME_PHASES.WINNER : GAME_PHASES.GAMEPLAY,
          });
          _publish();
        },

        rejectDing: () => {
          // Resume timer from where it paused
          const now = Date.now();
          set({
            dingTeamIndex: null,
            timerPausedAt: null,
            turnStartTime: now,
            turnPhase: TURN_PHASES.DESCRIBING,
          });
          _publish();
        },

        endTurn: () => {
          const { currentTeamIndex, teams } = get();
          const next = (currentTeamIndex + 1) % teams.length;
          set({
            currentTeamIndex: next,
            ...resetTurnState(),
          });
          _publish();
        },

        triggerConfetti: () => set((s) => ({ confettiTrigger: s.confettiTrigger + 1 })),

        resetGame: () => set({ ...initial }),
      };
    },
    {
      name: "no-umm-v2",
      partialize: (s) => ({
        phase: s.phase,
        roomCode: s.roomCode,
        numTeams: s.numTeams,
        boardLength: s.boardLength,
        timerSeconds: s.timerSeconds,
        teams: s.teams,
        currentTeamIndex: s.currentTeamIndex,
        turnPhase: s.turnPhase,
        turnStartTime: s.turnStartTime,
        timerPausedAt: s.timerPausedAt,
        timeElapsedBeforePause: s.timeElapsedBeforePause,
        currentWordPair: s.currentWordPair,
        usedWordPairs: s.usedWordPairs,
        activeRules: s.activeRules,
        winnerTeamId: s.winnerTeamId,
        ruleDraftComplete: s.ruleDraftComplete,
      }),
    }
  )
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetTurnState() {
  return {
    turnPhase: TURN_PHASES.IDLE,
    currentWordPair: null,
    turnStartTime: null,
    timerPausedAt: null,
    timeElapsedBeforePause: 0,
    dingTeamIndex: null,
    turnLog: [],
  };
}

export { DEFAULT_BOARD as DEFAULT_BOARD_LENGTH, DEFAULT_TIMER as DEFAULT_TIMER_SECONDS };
