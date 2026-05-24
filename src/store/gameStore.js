/**
 * gameStore.js — Central Zustand store for all game state.
 *
 * Architecture note: designed so real multiplayer could be added later
 * by replacing store mutations with API calls / WebSocket events.
 * The store shape is the single source of truth; all UI reads from here.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateDefaultTeams, generateRoomCode } from "../data/teams";
import { drawRules } from "../data/rules";
import { drawWordPair } from "../data/words";

// ─── Constants ───────────────────────────────────────────────────────────────

export const GAME_PHASES = {
  LANDING:      "landing",
  LOBBY:        "lobby",
  TEAM_SETUP:   "team_setup",
  RULE_DRAFT:   "rule_draft",
  GAMEPLAY:     "gameplay",
  WINNER:       "winner",
};

export const TURN_PHASES = {
  IDLE:         "idle",       // between turns
  DESCRIBING:   "describing", // timer running, describer active
  DING_REVIEW:  "ding_review",// a ding was pressed, review in progress
  TURN_END:     "turn_end",   // turn finished, showing results
};

const DEFAULT_BOARD_LENGTH = 30;
const DEFAULT_TIMER_SECONDS = 45;
const DANGER_ZONE_SIZE = 5;   // last N spaces are danger zone
const YELLOW_INTERVAL = 5;    // every Nth space is yellow

// ─── Initial state ────────────────────────────────────────────────────────────

const initialState = {
  phase: GAME_PHASES.LANDING,

  // Lobby
  roomCode: null,
  isHost: true,

  // Settings
  numTeams: 2,
  boardLength: DEFAULT_BOARD_LENGTH,
  timerSeconds: DEFAULT_TIMER_SECONDS,

  // Teams
  teams: [],

  // Rule draft
  ruleDraftComplete: false,

  // Gameplay
  currentTeamIndex: 0,
  turnPhase: TURN_PHASES.IDLE,
  currentWordPair: null,      // { wordA, wordB, key }
  usedWordPairs: [],
  timerRemaining: DEFAULT_TIMER_SECONDS,
  timerActive: false,
  activeRules: [],            // global active rules (from yellow spaces)

  // Ding
  dingTeamIndex: null,        // which team pressed ding

  // Score/move log for current turn
  turnLog: [],                // [{ type: "correct"|"ding", teamId, wordPair }]

  // Confetti trigger
  confettiTrigger: 0,

  // Winner
  winnerTeamId: null,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Navigation ──────────────────────────────────────────────────────────

      setPhase: (phase) => set({ phase }),

      goToLanding: () => set({ ...initialState }),

      // ── Lobby ───────────────────────────────────────────────────────────────

      createRoom: ({ numTeams, boardLength, timerSeconds }) => {
        const roomCode = generateRoomCode();
        const teams = generateDefaultTeams(numTeams);
        set({
          roomCode,
          isHost: true,
          numTeams,
          boardLength,
          timerSeconds,
          timerRemaining: timerSeconds,
          teams,
          phase: GAME_PHASES.TEAM_SETUP,
        });
      },

      joinRoom: (code) => {
        // In a real app this would fetch room state from a server.
        // For local play we just set the code and navigate.
        set({ roomCode: code.toUpperCase(), isHost: false, phase: GAME_PHASES.TEAM_SETUP });
      },

      // ── Team Setup ──────────────────────────────────────────────────────────

      updateTeam: (teamId, updates) => {
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === teamId ? { ...t, ...updates } : t
          ),
        }));
      },

      // ── Rule Draft ──────────────────────────────────────────────────────────

      /**
       * Deal 6 random rule cards to each team at the start of the draft phase.
       * Each team then picks 3 to assign to another team.
       */
      dealRuleCards: () => {
        const { teams } = get();
        const allUsedIds = [];

        const updatedTeams = teams.map((team) => {
          const cards = drawRules(6, allUsedIds);
          cards.forEach((c) => allUsedIds.push(c.id));
          return { ...team, ruleCards: cards, selectedDraftCards: [] };
        });

        set({ teams: updatedTeams, phase: GAME_PHASES.RULE_DRAFT });
      },

      /**
       * Toggle a rule card selection during draft phase.
       * Teams select exactly 3 cards to pass to the next team.
       */
      toggleDraftCard: (teamId, ruleId) => {
        set((state) => ({
          teams: state.teams.map((t) => {
            if (t.id !== teamId) return t;
            const already = t.selectedDraftCards?.includes(ruleId);
            if (already) {
              return { ...t, selectedDraftCards: t.selectedDraftCards.filter((id) => id !== ruleId) };
            }
            if ((t.selectedDraftCards?.length ?? 0) >= 3) return t; // max 3
            return { ...t, selectedDraftCards: [...(t.selectedDraftCards ?? []), ruleId] };
          }),
        }));
      },

      /**
       * Finalize drafts: assign each team's selected 3 cards to the next team.
       * Remaining cards are discarded.
       */
      finalizeDraft: () => {
        const { teams } = get();
        const n = teams.length;

        const updatedTeams = teams.map((team, i) => {
          const giver = teams[(i - 1 + n) % n]; // team to the left passes cards here
          const incoming = giver.ruleCards.filter((r) =>
            giver.selectedDraftCards?.includes(r.id)
          );
          return {
            ...team,
            ruleCards: [],
            selectedDraftCards: [],
            pendingRules: incoming,  // rules waiting to be activated when landing on yellow
            activeRules: [],
          };
        });

        set({ teams: updatedTeams, ruleDraftComplete: true, phase: GAME_PHASES.GAMEPLAY });
      },

      // ── Gameplay ─────────────────────────────────────────────────────────────

      startTurn: () => {
        const { timerSeconds, usedWordPairs } = get();
        const pair = drawWordPair(usedWordPairs);
        set({
          turnPhase: TURN_PHASES.DESCRIBING,
          currentWordPair: pair,
          usedWordPairs: [...usedWordPairs, pair.key],
          timerRemaining: timerSeconds,
          timerActive: true,
          turnLog: [],
          dingTeamIndex: null,
        });
      },

      /**
       * Called every second by the timer hook
       */
      tickTimer: () => {
        const { timerRemaining } = get();
        if (timerRemaining <= 1) {
          set({ timerRemaining: 0, timerActive: false, turnPhase: TURN_PHASES.TURN_END });
        } else {
          set({ timerRemaining: timerRemaining - 1 });
        }
      },

      /**
       * Active team scored a correct guess: move forward 1 space.
       * Draw a new word pair immediately.
       */
      scoreCorrect: () => {
        const { currentTeamIndex, teams, boardLength, usedWordPairs, currentWordPair, timerActive } = get();
        if (!timerActive) return;

        const team = teams[currentTeamIndex];
        const newPosition = Math.min(team.position + 1, boardLength);
        const isWinner = newPosition >= boardLength;

        // Check yellow space
        const newActiveRules = get().activeRules;
        let updatedTeams = teams.map((t, i) => {
          if (i !== currentTeamIndex) return t;
          const updated = { ...t, position: newPosition };
          // Activate pending rules if landing on / passing yellow
          if (isYellowSpace(newPosition) || crossedYellow(team.position, newPosition)) {
            const rulesToActivate = updated.pendingRules?.slice(0, 1) ?? [];
            return {
              ...updated,
              activeRules: [...(updated.activeRules ?? []), ...rulesToActivate],
              pendingRules: (updated.pendingRules ?? []).slice(1),
            };
          }
          return updated;
        });

        const log = get().turnLog;
        const newPair = drawWordPair(usedWordPairs);

        set({
          teams: updatedTeams,
          usedWordPairs: [...usedWordPairs, newPair.key],
          currentWordPair: newPair,
          turnLog: [...log, { type: "correct", teamId: team.id, word: currentWordPair }],
          winnerTeamId: isWinner ? team.id : null,
          phase: isWinner ? GAME_PHASES.WINNER : GAME_PHASES.GAMEPLAY,
        });
      },

      /**
       * A non-active team pressed DING.
       */
      pressDing: (dingTeamIndex) => {
        const { turnPhase } = get();
        if (turnPhase !== TURN_PHASES.DESCRIBING) return;
        set({
          dingTeamIndex,
          timerActive: false,
          turnPhase: TURN_PHASES.DING_REVIEW,
        });
      },

      /**
       * Host confirms ding was valid: ding team advances, timer resumes.
       */
      confirmDing: () => {
        const { dingTeamIndex, teams, boardLength, timerSeconds, timerRemaining } = get();
        if (dingTeamIndex === null) return;

        const dingTeam = teams[dingTeamIndex];
        const newPosition = Math.min(dingTeam.position + 1, boardLength);
        const isWinner = newPosition >= boardLength;

        const updatedTeams = teams.map((t, i) => {
          if (i !== dingTeamIndex) return t;
          return { ...t, position: newPosition };
        });

        const pair = drawWordPair(get().usedWordPairs);

        set({
          teams: updatedTeams,
          dingTeamIndex: null,
          timerActive: !isWinner,
          turnPhase: isWinner ? TURN_PHASES.IDLE : TURN_PHASES.DESCRIBING,
          currentWordPair: pair,
          usedWordPairs: [...get().usedWordPairs, pair.key],
          winnerTeamId: isWinner ? dingTeam.id : null,
          phase: isWinner ? GAME_PHASES.WINNER : GAME_PHASES.GAMEPLAY,
        });
      },

      /**
       * Host rejects ding: resume timer.
       */
      rejectDing: () => {
        set({
          dingTeamIndex: null,
          timerActive: true,
          turnPhase: TURN_PHASES.DESCRIBING,
        });
      },

      /**
       * End the current turn and advance to next team.
       */
      endTurn: () => {
        const { currentTeamIndex, teams } = get();
        const nextIndex = (currentTeamIndex + 1) % teams.length;
        set({
          currentTeamIndex: nextIndex,
          turnPhase: TURN_PHASES.IDLE,
          timerActive: false,
          currentWordPair: null,
          dingTeamIndex: null,
          turnLog: [],
        });
      },

      // ── Confetti ────────────────────────────────────────────────────────────

      triggerConfetti: () => set((s) => ({ confettiTrigger: s.confettiTrigger + 1 })),

      // ── Reset ────────────────────────────────────────────────────────────────

      resetGame: () => set({ ...initialState }),
    }),
    {
      name: "no-umm-game-state",
      // Only persist what matters across page refreshes
      partialize: (state) => ({
        phase: state.phase,
        roomCode: state.roomCode,
        isHost: state.isHost,
        numTeams: state.numTeams,
        boardLength: state.boardLength,
        timerSeconds: state.timerSeconds,
        teams: state.teams,
        currentTeamIndex: state.currentTeamIndex,
        turnPhase: state.turnPhase,
        timerRemaining: state.timerRemaining,
        activeRules: state.activeRules,
        usedWordPairs: state.usedWordPairs,
        currentWordPair: state.currentWordPair,
        winnerTeamId: state.winnerTeamId,
      }),
    }
  )
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isYellowSpace(position) {
  return position > 0 && position % YELLOW_INTERVAL === 0;
}

export function crossedYellow(oldPos, newPos) {
  for (let p = oldPos + 1; p <= newPos; p++) {
    if (isYellowSpace(p)) return true;
  }
  return false;
}

export function isDangerZone(position, boardLength) {
  return position > boardLength - DANGER_ZONE_SIZE;
}

export { DANGER_ZONE_SIZE, YELLOW_INTERVAL, DEFAULT_BOARD_LENGTH, DEFAULT_TIMER_SECONDS };
