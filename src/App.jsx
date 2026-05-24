/**
 * App.jsx — Root component with React Router.
 *
 * Routes:
 *   /                  → LandingPage (mode selection)
 *   /team              → LobbyPage (team mode create / join)
 *   /game/:roomCode    → TeamGameApp (TEAM_SETUP → RULE_DRAFT → GAMEPLAY → WINNER)
 *   /duel              → DuelLobbyPage
 *   /duel/:roomCode    → DuelGameApp  (SETUP → GAMEPLAY → WINNER)
 *
 * Multi-party isolation: each browser tab opens its own URL (/game/ABCD vs /game/EFGH).
 * Firebase rooms are keyed by roomCode; localStorage is per-tab within the same browser.
 */

import { useEffect } from "react";
import { Routes, Route, Navigate, useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { useGameStore, GAME_PHASES } from "./store/gameStore";
import { useDuelStore, DUEL_PHASES } from "./store/duelStore";
import { DeviceProvider } from "./context/DeviceContext";
import { useConfetti } from "./hooks/useConfetti";
import { useRoomSync } from "./hooks/useRoomSync";
import { useDuelSync } from "./hooks/useDuelSync";

import { LandingPage }   from "./pages/LandingPage";
import { LobbyPage }     from "./pages/LobbyPage";
import { TeamSetupPage } from "./pages/TeamSetupPage";
import { RuleDraftPage } from "./pages/RuleDraftPage";
import { GameplayPage }  from "./pages/GameplayPage";
import { WinnerPage }    from "./pages/WinnerPage";

import { DuelLobbyPage }    from "./pages/duel/DuelLobbyPage";
import { DuelSetupPage }    from "./pages/duel/DuelSetupPage";
import { DuelGameplayPage } from "./pages/duel/DuelGameplayPage";
import { DuelWinnerPage }   from "./pages/duel/DuelWinnerPage";

// ─── Shared page-transition wrapper ──────────────────────────────────────────

const tx = {
  initial:    { opacity: 0, y: 12 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -12 },
  transition: { duration: 0.22, ease: "easeInOut" },
};

function Wrap({ children }) {
  return <motion.div {...tx} className="w-full min-h-screen">{children}</motion.div>;
}

// ─── Team game route (/game/:roomCode) ────────────────────────────────────────

function TeamGameApp() {
  const { roomCode: urlCode } = useParams();
  const navigate              = useNavigate();
  const phase                 = useGameStore((s) => s.phase);
  const storeRoomCode         = useGameStore((s) => s.roomCode);
  const joinRoom              = useGameStore((s) => s.joinRoom);

  useConfetti();
  useRoomSync();

  // Auto-join when arriving via a direct URL (e.g. shared link, page refresh)
  useEffect(() => {
    if (urlCode && storeRoomCode?.toUpperCase() !== urlCode.toUpperCase()) {
      joinRoom(urlCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigate away whenever the game is fully reset
  useEffect(() => {
    if (phase === GAME_PHASES.LANDING || phase === GAME_PHASES.LOBBY) {
      navigate("/", { replace: true });
    }
  }, [phase, navigate]);

  if (phase === GAME_PHASES.LANDING || phase === GAME_PHASES.LOBBY) return null;

  return (
    <AnimatePresence mode="wait">
      {phase === GAME_PHASES.TEAM_SETUP && <Wrap key="ts"><TeamSetupPage /></Wrap>}
      {phase === GAME_PHASES.RULE_DRAFT && <Wrap key="rd"><RuleDraftPage /></Wrap>}
      {phase === GAME_PHASES.GAMEPLAY   && <Wrap key="gp"><GameplayPage /></Wrap>}
      {phase === GAME_PHASES.WINNER     && <Wrap key="wn"><WinnerPage /></Wrap>}
    </AnimatePresence>
  );
}

// ─── Duel game route (/duel/:roomCode) ────────────────────────────────────────

function DuelGameApp() {
  const { roomCode: urlCode } = useParams();
  const navigate              = useNavigate();
  const phase                 = useDuelStore((s) => s.phase);
  const storeRoomCode         = useDuelStore((s) => s.roomCode);
  const joinDuel              = useDuelStore((s) => s.joinDuel);

  useDuelSync();

  useEffect(() => {
    if (urlCode && storeRoomCode?.toUpperCase() !== urlCode.toUpperCase()) {
      joinDuel(urlCode);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase === DUEL_PHASES.LANDING) {
      navigate("/", { replace: true });
    }
  }, [phase, navigate]);

  if (phase === DUEL_PHASES.LANDING) return null;

  return (
    <AnimatePresence mode="wait">
      {phase === DUEL_PHASES.SETUP    && <Wrap key="du-s"><DuelSetupPage /></Wrap>}
      {phase === DUEL_PHASES.GAMEPLAY && <Wrap key="du-g"><DuelGameplayPage /></Wrap>}
      {phase === DUEL_PHASES.WINNER   && <Wrap key="du-w"><DuelWinnerPage /></Wrap>}
    </AnimatePresence>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <DeviceProvider>
      <Routes>
        <Route path="/"                element={<LandingPage />} />
        <Route path="/team"            element={<LobbyPage />} />
        <Route path="/game/:roomCode"  element={<TeamGameApp />} />
        <Route path="/duel"            element={<DuelLobbyPage />} />
        <Route path="/duel/:roomCode"  element={<DuelGameApp />} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </DeviceProvider>
  );
}
