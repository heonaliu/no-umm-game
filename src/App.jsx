/**
 * App.jsx — Root component.
 *
 * Routing is phase-based (not URL-based) since the game is a single-session
 * experience. The `phase` in Zustand determines which screen to render.
 *
 * Screens:
 *   landing    → LandingPage
 *   lobby      → LobbyPage
 *   team_setup → TeamSetupPage
 *   rule_draft → RuleDraftPage
 *   gameplay   → GameplayPage
 *   winner     → WinnerPage
 */

import { AnimatePresence, motion } from "framer-motion";
import { useGameStore, GAME_PHASES } from "./store/gameStore";
// Note: App.css is intentionally empty — all styles use Tailwind + index.css
import { useConfetti } from "./hooks/useConfetti";

import { LandingPage }   from "./pages/LandingPage";
import { LobbyPage }     from "./pages/LobbyPage";
import { TeamSetupPage } from "./pages/TeamSetupPage";
import { RuleDraftPage } from "./pages/RuleDraftPage";
import { GameplayPage }  from "./pages/GameplayPage";
import { WinnerPage }    from "./pages/WinnerPage";

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.25,
};

function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const phase = useGameStore((s) => s.phase);

  // Mount the global confetti hook
  useConfetti();

  return (
    <div className="w-full min-h-screen bg-[#0f0a1e]">
      <AnimatePresence mode="wait">
        {phase === GAME_PHASES.LANDING && (
          <PageWrapper key="landing"><LandingPage /></PageWrapper>
        )}
        {phase === GAME_PHASES.LOBBY && (
          <PageWrapper key="lobby"><LobbyPage /></PageWrapper>
        )}
        {phase === GAME_PHASES.TEAM_SETUP && (
          <PageWrapper key="team-setup"><TeamSetupPage /></PageWrapper>
        )}
        {phase === GAME_PHASES.RULE_DRAFT && (
          <PageWrapper key="rule-draft"><RuleDraftPage /></PageWrapper>
        )}
        {phase === GAME_PHASES.GAMEPLAY && (
          <PageWrapper key="gameplay"><GameplayPage /></PageWrapper>
        )}
        {phase === GAME_PHASES.WINNER && (
          <PageWrapper key="winner"><WinnerPage /></PageWrapper>
        )}
      </AnimatePresence>
    </div>
  );
}
