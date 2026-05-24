/**
 * gameStore.js — Zustand store for all game state.
 *
 * Timer:      timestamp-based (turnStartTime epoch ms), computed locally on every device.
 * Multiplayer: _publish() writes sync slice to Firebase after every mutation.
 * autoDing:   when true, DING resolves immediately without host confirmation.
 * dingCount:  incremented on every ding — all devices watch it to play the sound.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateDefaultTeams } from "../data/teams";
import { drawRules } from "../data/rules";
import { drawWordPair } from "../data/words";
import { pushRoom, isOnlineMode, generateUniqueRoomCode } from "../lib/roomSync";
import { crossedYellow } from "./boardHelpers";

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

const DEFAULT_BOARD = 30;
const DEFAULT_TIMER = 45;

// Fields synced to Firebase
const SYNC_FIELDS = [
  "phase", "numTeams", "boardLength", "timerSeconds", "autoDing",
  "teams", "currentTeamIndex", "turnPhase",
  "turnStartTime", "timerPausedAt", "timeElapsedBeforePause",
  "currentWordPair", "usedWordPairs",
  "dingTeamIndex", "dingCount", "activeRules", "turnLog",
  "winnerTeamId", "ruleDraftComplete",
  "teamClaims",   // { [teamIndex]: deviceId } — prevents two devices claiming one slot
];

// ─── Initial state ────────────────────────────────────────────────────────────

const initial = {
  phase: GAME_PHASES.LANDING,
  roomCode: null,

  numTeams:     2,
  boardLength:  DEFAULT_BOARD,
  timerSeconds: DEFAULT_TIMER,
  autoDing:     false,   // ← skip host confirmation when true

  teams: [],
  ruleDraftComplete: false,

  currentTeamIndex: 0,
  turnPhase: TURN_PHASES.IDLE,

  turnStartTime:          null,
  timerPausedAt:          null,
  timeElapsedBeforePause: 0,

  currentWordPair: null,
  usedWordPairs:   [],
  dingTeamIndex:   null,
  dingCount:       0,    // ← incremented on every ding; all devices play sound when it changes
  activeRules:     [],
  turnLog:         [],
  winnerTeamId:    null,
  teamClaims:      {},   // ← { [teamIndex]: deviceId } synced to Firebase
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create(
  persist(
    (set, get) => {
      const _publish = () => {
        const s = get();
        if (!s.roomCode || !isOnlineMode) return;
        const slice = {};
        for (const k of SYNC_FIELDS) slice[k] = s[k];
        pushRoom(s.roomCode, slice);
      };

      // Shared logic: score the ding team +1 and resume/end
      const _applyDing = (dingTeamIndex) => {
        const { teams, boardLength, usedWordPairs } = get();
        const dingTeam = teams[dingTeamIndex];
        const newPos   = Math.min(dingTeam.position + 1, boardLength);
        const isWinner = newPos >= boardLength;
        const updatedTeams = teams.map((t, i) =>
          i === dingTeamIndex ? { ...t, position: newPos } : t
        );
        const now     = Date.now();
        const newPair = drawWordPair(usedWordPairs);
        set({
          teams: updatedTeams,
          dingTeamIndex: null,
          timerPausedAt: null,
          turnStartTime: isWinner ? null : now,
          currentWordPair: isWinner ? get().currentWordPair : newPair,
          usedWordPairs:   isWinner ? usedWordPairs : [...usedWordPairs, newPair.key],
          turnPhase:    isWinner ? TURN_PHASES.IDLE : TURN_PHASES.DESCRIBING,
          winnerTeamId: isWinner ? dingTeam.id : null,
          phase:        isWinner ? GAME_PHASES.WINNER : GAME_PHASES.GAMEPLAY,
        });
      };

      return {
        ...initial,

        // ── Navigation ─────────────────────────────────────────────────────

        setPhase: (phase) => { set({ phase }); _publish(); },
        goToLanding: () => set({ ...initial }),

        // ── Lobby ──────────────────────────────────────────────────────────

        createRoom: async ({ numTeams, boardLength, timerSeconds, autoDing = false, hostDeviceId = null }) => {
          const roomCode   = await generateUniqueRoomCode();
          const teams      = generateDefaultTeams(numTeams);
          // Host always occupies slot 0
          const teamClaims = hostDeviceId ? { "0": hostDeviceId } : {};
          set({
            roomCode, numTeams, boardLength, timerSeconds, autoDing,
            teams, teamClaims,
            phase: GAME_PHASES.TEAM_SETUP,
            ...resetTurnState(),
          });
          _publish();
          return roomCode;
        },

        joinRoom: (code) => {
          set({ roomCode: code.toUpperCase(), phase: GAME_PHASES.TEAM_SETUP });
        },

        /**
         * Claim a team slot for a device.
         * Automatically releases any other slot the same device previously held.
         * Passing teamIndex = null just releases without claiming anything new.
         */
        claimTeamSlot: (teamIndex, deviceId) => {
          if (!deviceId) return;
          const claims = { ...(get().teamClaims ?? {}) };
          // Release any slot this device already holds
          for (const key of Object.keys(claims)) {
            if (claims[key] === deviceId) delete claims[key];
          }
          // Claim the new slot
          if (teamIndex !== null && teamIndex !== undefined) {
            claims[String(teamIndex)] = deviceId;
          }
          set({ teamClaims: claims });
          _publish();
        },

        /** Remove a device's claim entirely (e.g. on game reset). */
        releaseTeamSlot: (deviceId) => {
          if (!deviceId) return;
          const claims = { ...(get().teamClaims ?? {}) };
          for (const key of Object.keys(claims)) {
            if (claims[key] === deviceId) delete claims[key];
          }
          set({ teamClaims: claims });
          _publish();
        },

        // ── Remote sync ────────────────────────────────────────────────────

        syncFromRemote: (remote) => {
          const { roomCode } = get();
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

        handleTimerExpired: () => {
          const { turnPhase } = get();
          if (turnPhase !== TURN_PHASES.DESCRIBING) return;
          set({ timerPausedAt: Date.now(), turnPhase: TURN_PHASES.TURN_END });
          _publish();
        },

        scoreCorrect: () => {
          const { currentTeamIndex, teams, boardLength, usedWordPairs, currentWordPair } = get();
          const team   = teams[currentTeamIndex];
          const newPos = Math.min(team.position + 1, boardLength);
          const isWinner = newPos >= boardLength;

          let updatedTeams = teams.map((t, i) => {
            if (i !== currentTeamIndex) return t;
            const u = { ...t, position: newPos };
            if (crossedYellow(t.position, newPos) && (u.pendingRules?.length ?? 0) > 0) {
              return { ...u, activeRules: [...(u.activeRules ?? []), u.pendingRules[0]], pendingRules: u.pendingRules.slice(1) };
            }
            return u;
          });

          const newPair = drawWordPair([...usedWordPairs]);
          const log     = [...get().turnLog, { type: "correct", teamId: team.id, word: currentWordPair }];

          set({
            teams: updatedTeams,
            currentWordPair: newPair,
            usedWordPairs: [...usedWordPairs, newPair.key],
            turnLog: log,
            winnerTeamId: isWinner ? team.id : null,
            phase: isWinner ? GAME_PHASES.WINNER : GAME_PHASES.GAMEPLAY,
            // NOTE: no confettiTrigger here — UI calls burstConfetti() directly
          });
          _publish();
        },

        pressDing: (dingTeamIndex) => {
          const { turnPhase, autoDing, dingCount } = get();
          if (turnPhase !== TURN_PHASES.DESCRIBING) return;

          const now     = Date.now();
          const elapsed = get().timeElapsedBeforePause + (now - get().turnStartTime) / 1000;

          if (autoDing) {
            // ── Instant mode: skip review, immediately award the point ──
            set({
              dingTeamIndex: null,
              timerPausedAt: now,
              timeElapsedBeforePause: elapsed,
              turnStartTime: null,
              dingCount: dingCount + 1, // triggers sound on all devices
            });
            _applyDing(dingTeamIndex);
          } else {
            // ── Standard mode: pause for host review ──
            set({
              dingTeamIndex,
              timerPausedAt: now,
              timeElapsedBeforePause: elapsed,
              turnStartTime: null,
              turnPhase: TURN_PHASES.DING_REVIEW,
              dingCount: dingCount + 1, // triggers sound on all devices
            });
          }
          _publish();
        },

        confirmDing: () => {
          const { dingTeamIndex } = get();
          if (dingTeamIndex === null) return;
          _applyDing(dingTeamIndex);
          _publish();
        },

        rejectDing: () => {
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
          set({ currentTeamIndex: next, ...resetTurnState() });
          _publish();
        },

        resetGame: () => set({ ...initial }),

        /**
         * Play Again — keeps the same room code, board settings, and team
         * names/colours/pawns but resets all positions, rules, and turn state.
         * Goes back to TEAM_SETUP so the host can start a fresh draft.
         */
        playAgain: () => {
          const { roomCode, numTeams, boardLength, timerSeconds, autoDing, teams } = get();
          const freshTeams = teams.map((t) => ({
            id: t.id,
            name: t.name,
            color: t.color,
            pawn: t.pawn,
            position: 0,
            score: 0,
            ruleCards: [],
            activeRules: [],
            pendingRules: [],
            selectedDraftCards: [],
          }));
          set({
            ...initial,
            roomCode,
            numTeams,
            boardLength,
            timerSeconds,
            autoDing,
            teams: freshTeams,
            phase: GAME_PHASES.TEAM_SETUP,
          });
          _publish();
        },
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
        autoDing: s.autoDing,
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
