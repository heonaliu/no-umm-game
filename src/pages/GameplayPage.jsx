/**
 * GameplayPage — the main in-game screen.
 *
 * Layout (large screen):
 *   Left col:  board + team progress + active rules
 *   Right col: turn panel (timer, word card, controls, ding buttons)
 *
 * On small screens everything stacks vertically.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, TURN_PHASES, isDangerZone } from "../store/gameStore";
import { useTimer } from "../hooks/useTimer";
import { burstConfetti } from "../hooks/useConfetti";

import { GameBoard }         from "../components/board/GameBoard";
import { CountdownTimer }    from "../components/game/CountdownTimer";
import { WordCard }          from "../components/game/WordCard";
import { DingButton }        from "../components/game/DingButton";
import { DingReviewModal }   from "../components/game/DingReviewModal";
import { RuleRevealModal }   from "../components/game/RuleRevealModal";
import { ActiveRulesPanel }  from "../components/game/ActiveRulesPanel";
import { TeamProgressBar }   from "../components/game/TeamProgressBar";
import { Button }            from "../components/ui/Button";

export function GameplayPage() {
  // Activate the global timer hook
  useTimer();

  const teams            = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const turnPhase        = useGameStore((s) => s.turnPhase);
  const boardLength      = useGameStore((s) => s.boardLength);
  const turnLog          = useGameStore((s) => s.turnLog);

  const startTurn   = useGameStore((s) => s.startTurn);
  const scoreCorrect = useGameStore((s) => s.scoreCorrect);
  const endTurn     = useGameStore((s) => s.endTurn);

  const activeTeam = teams[currentTeamIndex];
  const inDanger   = isDangerZone(activeTeam?.position ?? 0, boardLength);

  // ── Rule reveal modal state ───────────────────────────────────────────────
  const [revealRule, setRevealRule] = useState(null);
  const [revealTeam, setRevealTeam] = useState(null);
  const prevActiveRulesRef = useRef([]);

  // Watch for newly activated rules after scoring a correct answer
  useEffect(() => {
    teams.forEach((team) => {
      const prev = prevActiveRulesRef.current.find((t) => t.id === team.id);
      const prevCount = prev?.activeRules?.length ?? 0;
      const currCount = team.activeRules?.length ?? 0;
      if (currCount > prevCount) {
        const newRule = team.activeRules[currCount - 1];
        setRevealRule(newRule);
        setRevealTeam(team);
      }
    });
    prevActiveRulesRef.current = teams.map((t) => ({
      id: t.id,
      activeRules: t.activeRules ?? [],
    }));
  }, [teams]);

  const handleCorrect = () => {
    burstConfetti({ x: 0.5, y: 0.6 });
    scoreCorrect();
  };

  // Count correct guesses this turn
  const correctCount = turnLog.filter((e) => e.type === "correct").length;

  return (
    <div className="min-h-screen p-3 lg:p-5">
      {/* Danger zone global warning banner */}
      <AnimatePresence>
        {inDanger && (
          <motion.div
            key="danger-banner"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="mb-4 rounded-2xl border-2 border-red-500 bg-red-500/20 p-3 text-center text-red-300 font-bold text-sm"
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🔥 DANGER ZONE — Nobody may say "um" or "uh" (including guessers!) 🔥
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
        {/* ── LEFT COLUMN: Board + Progress + Rules ── */}
        <div className="flex-1 space-y-4 min-w-0">
          <GameBoard />
          <TeamProgressBar />
          <ActiveRulesPanel />
        </div>

        {/* ── RIGHT COLUMN: Turn controls ── */}
        <div className="lg:w-[400px] shrink-0 space-y-4">

          {/* Active team indicator */}
          <motion.div
            key={currentTeamIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border-2 p-4 text-center"
            style={{
              borderColor: `${activeTeam?.color?.hex}60`,
              backgroundColor: `${activeTeam?.color?.hex}15`,
            }}
          >
            <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Active Team</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">{activeTeam?.pawn}</span>
              <h2
                className="font-display text-3xl"
                style={{ color: activeTeam?.color?.hex }}
              >
                {activeTeam?.name}
              </h2>
            </div>
            <p className="text-white/40 text-xs mt-1">
              Space {activeTeam?.position} / {boardLength}
              {inDanger && <span className="text-red-400 font-bold ml-2">🔥 DANGER ZONE</span>}
            </p>
          </motion.div>

          {/* ── Phase: IDLE ── */}
          <AnimatePresence mode="wait">
            {turnPhase === TURN_PHASES.IDLE && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3"
              >
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center text-white/60 text-sm leading-relaxed">
                  <p className="text-3xl mb-3">👤</p>
                  <p>
                    Choose a describer for{" "}
                    <strong style={{ color: activeTeam?.color?.hex }}>{activeTeam?.name}</strong>.
                    <br />
                    Everyone else will guess.
                    <br /><br />
                    Hit <em className="text-violet-300">Start Turn</em> when ready — the timer starts immediately!
                  </p>
                  {inDanger && (
                    <p className="mt-3 text-red-400 text-xs font-bold">
                      ⚠️ You're in the Danger Zone — guessers also can't say um/uh!
                    </p>
                  )}
                </div>

                <Button size="xl" variant="primary" className="w-full" onClick={startTurn}>
                  ▶ Start Turn
                </Button>
              </motion.div>
            )}

            {/* ── Phase: DESCRIBING ── */}
            {(turnPhase === TURN_PHASES.DESCRIBING || turnPhase === TURN_PHASES.DING_REVIEW) && (
              <motion.div
                key="describing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Timer row */}
                <div className="flex items-center gap-3">
                  <CountdownTimer />
                  <div className="flex-1 min-w-0">
                    <WordCard />
                  </div>
                </div>

                {/* Turn counter */}
                {correctCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-emerald-400 font-display text-lg"
                  >
                    ✅ {correctCount} correct this turn!
                  </motion.div>
                )}

                {/* Correct button */}
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  onClick={handleCorrect}
                  disabled={turnPhase !== TURN_PHASES.DESCRIBING}
                  className="w-full rounded-2xl border-4 border-emerald-400 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed py-5 px-4 font-display text-2xl text-white shadow-lg shadow-emerald-900/50 transition-colors cursor-pointer select-none"
                >
                  ✅ Correct! +1 Space
                </motion.button>

                <p className="text-xs text-white/30 text-center">
                  Press after both words guessed in correct order
                </p>
              </motion.div>
            )}

            {/* ── Phase: TURN_END ── */}
            {turnPhase === TURN_PHASES.TURN_END && (
              <motion.div
                key="turn-end"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="rounded-3xl border-2 border-violet-400/40 bg-violet-500/10 p-5 text-center">
                  <motion.p
                    className="text-5xl mb-3"
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    ⏱️
                  </motion.p>
                  <h2 className="font-display text-2xl text-white mb-2">Time's Up!</h2>
                  <div className="space-y-1 text-sm text-white/60">
                    <p>
                      <strong style={{ color: activeTeam?.color?.hex }}>{activeTeam?.name}</strong>{" "}
                      scored <strong className="text-emerald-400">{correctCount}</strong> correct{" "}
                      {correctCount === 1 ? "guess" : "guesses"} this turn.
                    </p>
                    <p className="text-white/40">
                      Now at space <strong className="text-white">{activeTeam?.position}</strong> / {boardLength}
                    </p>
                  </div>
                </div>

                <Button size="lg" variant="primary" className="w-full" onClick={endTurn}>
                  ▶ Next Team's Turn
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── DING buttons for all teams ── */}
          <AnimatePresence>
            {(turnPhase === TURN_PHASES.DESCRIBING || turnPhase === TURN_PHASES.DING_REVIEW) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <p className="text-xs uppercase tracking-widest text-white/30 text-center font-bold">
                  🔔 Other teams — press DING if you hear a violation!
                </p>
                {teams.map((_, i) => (
                  <DingButton key={i} teamIndex={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Overlays */}
      <DingReviewModal />
      <RuleRevealModal
        rule={revealRule}
        teamName={revealTeam?.name}
        teamColor={revealTeam?.color?.hex}
        isOpen={!!revealRule}
        onClose={() => { setRevealRule(null); setRevealTeam(null); }}
      />
    </div>
  );
}
