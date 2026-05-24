/**
 * App.jsx — Root component.
 *
 * Provides:
 *   • DeviceProvider   — persists per-device team identity
 *   • useRoomSync      — subscribes to Firebase room (no-op in local mode)
 *   • useConfetti      — global confetti hook
 *   • Phase-based router
 */

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore, GAME_PHASES } from "./store/gameStore";
import { DeviceProvider } from "./context/DeviceContext";
import { useConfetti } from "./hooks/useConfetti";
import { useRoomSync } from "./hooks/useRoomSync";

import { LandingPage }   from "./pages/LandingPage";
import { LobbyPage }     from "./pages/LobbyPage";
import { TeamSetupPage } from "./pages/TeamSetupPage";
import { RuleDraftPage } from "./pages/RuleDraftPage";
import { GameplayPage }  from "./pages/GameplayPage";
import { WinnerPage }    from "./pages/WinnerPage";

const tx = {
  initial:    { opacity: 0, y: 12 },
  animate:    { opacity: 1, y: 0  },
  exit:       { opacity: 0, y: -12 },
  transition: { duration: 0.22, ease: "easeInOut" },
};

function Wrap({ children }) {
  return (
    <motion.div {...tx} className="w-full min-h-screen">
      {children}
    </motion.div>
  );
}

function Inner() {
  const phase = useGameStore((s) => s.phase);
  useConfetti();
  useRoomSync();   // listens to Firebase room, no-op in local mode

  return (
    <div className="w-full min-h-screen">
      <AnimatePresence mode="wait">
        {phase === GAME_PHASES.LANDING    && <Wrap key="landing">   <LandingPage />   </Wrap>}
        {phase === GAME_PHASES.LOBBY      && <Wrap key="lobby">     <LobbyPage />     </Wrap>}
        {phase === GAME_PHASES.TEAM_SETUP && <Wrap key="team-setup"><TeamSetupPage /> </Wrap>}
        {phase === GAME_PHASES.RULE_DRAFT && <Wrap key="rule-draft"><RuleDraftPage /> </Wrap>}
        {phase === GAME_PHASES.GAMEPLAY   && <Wrap key="gameplay">  <GameplayPage />  </Wrap>}
        {phase === GAME_PHASES.WINNER     && <Wrap key="winner">    <WinnerPage />    </Wrap>}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <DeviceProvider>
      <Inner />
    </DeviceProvider>
  );
}
