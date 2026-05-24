/**
 * GameplayPage — the main gameplay screen.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  ACTIVE TEAM'S DEVICE          │  OTHER TEAM'S DEVICE          │
 * │  • Word card (describer only)  │  • Giant DING button           │
 * │  • ✓ Correct button            │  • Timer (read-only)           │
 * │  • Timer                       │  • "Listening…" panel          │
 * │  • DING buttons for others     │  • Board + rules (smaller)     │
 * │  • Board + rules               │                               │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * In LOCAL mode (single device), the full view is always shown since
 * all teams share one screen.
 *
 * Device view is determined by: myTeamIndex (from DeviceContext) vs
 * currentTeamIndex (from game store).
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Bell, Play, Timer, ChevronRight, Flame, Mic } from "lucide-react";
import { useGameStore, TURN_PHASES, isDangerZone } from "../store/gameStore";
import { useDevice } from "../context/DeviceContext";
import { burstConfetti } from "../hooks/useConfetti";
import { isOnlineMode } from "../lib/firebase";

import { GameBoard }          from "../components/board/GameBoard";
import { CountdownTimer }     from "../components/game/CountdownTimer";
import { WordCard }           from "../components/game/WordCard";
import { DingButton, DingSoundListener } from "../components/game/DingButton";
import { DingReviewModal }    from "../components/game/DingReviewModal";
import { RuleRevealModal }    from "../components/game/RuleRevealModal";
import { ActiveRulesPanel }   from "../components/game/ActiveRulesPanel";
import { TeamProgressBar }    from "../components/game/TeamProgressBar";
import { Button }             from "../components/ui/Button";

// ─── Non-active team view ─────────────────────────────────────────────────────

function ListeningView() {
  const teams            = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const turnPhase        = useGameStore((s) => s.turnPhase);
  const boardLength      = useGameStore((s) => s.boardLength);
  const { myTeamIndex }  = useDevice();
  const pressDing        = useGameStore((s) => s.pressDing);

  const activeTeam    = teams[currentTeamIndex];
  const isDescribing  = turnPhase === TURN_PHASES.DESCRIBING;
  const inDanger      = isDangerZone(activeTeam?.position ?? 0, boardLength);

  const myTeam = myTeamIndex !== null ? teams[myTeamIndex] : null;
  const isMyTurn = myTeamIndex === currentTeamIndex;

  if (isMyTurn) return null; // handled by ActiveView

  return (
    <div className="min-h-screen flex flex-col p-4 gap-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="rounded-2xl bg-white border border-sky-100 p-4 flex items-center gap-3 shadow-sm">
        <span className="text-3xl">{activeTeam?.pawn}</span>
        <div>
          <p className="text-xs text-sky-400 font-bold uppercase tracking-widest">Describing now</p>
          <p className="font-display text-lg text-sky-900" style={{ color: activeTeam?.color?.hex }}>
            {activeTeam?.name}
          </p>
        </div>
        <div className="ml-auto">
          <CountdownTimer />
        </div>
      </div>

      {inDanger && isDescribing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-red-300 bg-red-50 p-3 flex items-center gap-2 text-red-600 text-sm font-bold"
        >
          <Flame size={16} /> DANGER ZONE — no um/uh from ANYONE
        </motion.div>
      )}

      {/* GIANT DING button */}
      <motion.button
        onClick={() => isDescribing && pressDing(myTeamIndex ?? -1)}
        disabled={!isDescribing || myTeamIndex === null}
        whileTap={isDescribing ? { scale: 0.92 } : {}}
        whileHover={isDescribing ? { scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 380, damping: 16 }}
        className={`
          flex-1 min-h-[280px] rounded-3xl border-4 flex flex-col items-center justify-center gap-4
          font-display text-4xl select-none transition-all
          ${isDescribing
            ? "bg-red-600 border-red-500 text-white shadow-xl shadow-red-200 cursor-pointer"
            : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
          }
        `}
      >
        <motion.div
          animate={isDescribing ? { rotate: [-8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1 }}
        >
          <Bell size={72} className={isDescribing ? "text-white fill-white/20" : "text-gray-300"} />
        </motion.div>
        <span>{isDescribing ? "DING!" : turnPhase === TURN_PHASES.DING_REVIEW ? "Reviewing…" : "Waiting"}</span>
        {myTeam && (
          <span className="text-xl font-body font-bold opacity-75">
            {myTeam.pawn} {myTeam.name}
          </span>
        )}
      </motion.button>

      {!isDescribing && turnPhase !== TURN_PHASES.DING_REVIEW && (
        <p className="text-center text-sm text-sky-300">
          {turnPhase === TURN_PHASES.IDLE ? "Waiting for the active team to start their turn…"
          : turnPhase === TURN_PHASES.TURN_END ? "Turn ended — waiting for next turn…"
          : ""}
        </p>
      )}

      {/* Compact board + rules */}
      <div className="space-y-3">
        <TeamProgressBar />
        <ActiveRulesPanel />
      </div>
    </div>
  );
}

// ─── Active team's view ───────────────────────────────────────────────────────

function ActiveView() {
  const teams            = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const turnPhase        = useGameStore((s) => s.turnPhase);
  const boardLength      = useGameStore((s) => s.boardLength);
  const turnLog          = useGameStore((s) => s.turnLog);
  const startTurn        = useGameStore((s) => s.startTurn);
  const scoreCorrect     = useGameStore((s) => s.scoreCorrect);
  const endTurn          = useGameStore((s) => s.endTurn);

  const activeTeam = teams[currentTeamIndex];
  const inDanger   = isDangerZone(activeTeam?.position ?? 0, boardLength);
  const correctThisTurn = turnLog.filter((e) => e.type === "correct").length;

  const handleCorrect = () => {
    burstConfetti({ x: 0.5, y: 0.65 });
    scoreCorrect();
  };

  return (
    <div className="min-h-screen p-3 lg:p-5">
      <AnimatePresence>
        {inDanger && (
          <motion.div
            key="danger"
            initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 rounded-2xl border-2 border-red-300 bg-red-50 p-3 text-center text-red-600 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Flame size={16} className="animate-pulse" />
            DANGER ZONE — Nobody may say "um" or "uh" (including guessers!)
            <Flame size={16} className="animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
        {/* Left: board */}
        <div className="flex-1 space-y-4 min-w-0">
          <GameBoard />
          <TeamProgressBar />
          <ActiveRulesPanel />
        </div>

        {/* Right: turn controls */}
        <div className="lg:w-[400px] shrink-0 space-y-4">
          {/* Active team badge */}
          <motion.div
            key={currentTeamIndex}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border-2 p-4 text-center bg-white shadow-sm"
            style={{ borderColor: activeTeam?.color?.hex + "60" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-1">Active Team</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">{activeTeam?.pawn}</span>
              <h2 className="font-display text-3xl" style={{ color: activeTeam?.color?.hex }}>
                {activeTeam?.name}
              </h2>
            </div>
            <p className="text-sky-300 text-xs mt-1">
              Space {activeTeam?.position} / {boardLength}
              {inDanger && <span className="text-red-500 font-bold ml-2">🔥 Danger Zone</span>}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {turnPhase === TURN_PHASES.IDLE && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="rounded-2xl bg-sky-50 border border-sky-100 p-5 text-center text-sky-600 text-sm">
                  <Mic size={28} className="mx-auto mb-3 text-sky-400" />
                  <p>
                    Choose a describer for{" "}
                    <strong style={{ color: activeTeam?.color?.hex }}>{activeTeam?.name}</strong>.
                    Everyone else on your team will guess.
                  </p>
                  {inDanger && (
                    <p className="mt-2 text-red-500 text-xs font-bold">
                      ⚠️ Danger Zone — guessers also cannot say um/uh!
                    </p>
                  )}
                </div>
                <Button size="xl" variant="primary" className="w-full" onClick={startTurn} icon={Play}>
                  Start Turn
                </Button>
              </motion.div>
            )}

            {(turnPhase === TURN_PHASES.DESCRIBING || turnPhase === TURN_PHASES.DING_REVIEW) && (
              <motion.div
                key="describing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex items-start gap-3">
                  <CountdownTimer />
                  <div className="flex-1"><WordCard /></div>
                </div>

                {correctThisTurn > 0 && (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center text-emerald-600 font-bold font-display text-lg"
                  >
                    <CheckCircle size={18} className="inline mr-1" />
                    {correctThisTurn} correct this turn!
                  </motion.p>
                )}

                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleCorrect}
                  disabled={turnPhase !== TURN_PHASES.DESCRIBING}
                  className="w-full rounded-2xl border-2 border-emerald-300 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed py-5 px-4 font-display text-xl text-white shadow-md shadow-emerald-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle size={22} /> Correct! +1 Space
                </motion.button>

                <p className="text-xs text-sky-300 text-center">
                  Tap after both words guessed in order
                </p>
              </motion.div>
            )}

            {turnPhase === TURN_PHASES.TURN_END && (
              <motion.div
                key="end"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-5 text-center">
                  <Timer size={36} className="mx-auto mb-2 text-sky-400" />
                  <h2 className="font-display text-2xl text-sky-900 mb-1">Time's Up!</h2>
                  <p className="text-sky-500 text-sm">
                    <strong style={{ color: activeTeam?.color?.hex }}>{activeTeam?.name}</strong>{" "}
                    scored <strong className="text-emerald-600">{correctThisTurn}</strong> correct
                    {correctThisTurn === 1 ? " guess" : " guesses"} · now at space{" "}
                    <strong>{activeTeam?.position}</strong>
                  </p>
                </div>
                <Button size="lg" variant="primary" className="w-full" onClick={endTurn} icon={ChevronRight}>
                  Next Team's Turn
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* DING buttons for non-active teams (active device sees them too for local play) */}
          <AnimatePresence>
            {(turnPhase === TURN_PHASES.DESCRIBING || turnPhase === TURN_PHASES.DING_REVIEW) && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-sky-300 text-center flex items-center justify-center gap-1.5">
                  <Bell size={12} /> Other teams — tap DING to flag a violation!
                </p>
                {teams.map((_, i) => <DingButton key={i} teamIndex={i} />)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function GameplayPage() {
  const teams            = useGameStore((s) => s.teams);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const { myTeamIndex }  = useDevice();

  // Rule reveal tracking
  const [revealRule, setRevealRule] = useState(null);
  const [revealTeam, setRevealTeam] = useState(null);
  const prevRulesRef = useRef([]);

  useEffect(() => {
    teams.forEach((team) => {
      const prev  = prevRulesRef.current.find((t) => t.id === team.id);
      const prevN = prev?.activeRules?.length ?? 0;
      const currN = team.activeRules?.length ?? 0;
      if (currN > prevN) {
        setRevealRule(team.activeRules[currN - 1]);
        setRevealTeam(team);
      }
    });
    prevRulesRef.current = teams.map((t) => ({ id: t.id, activeRules: t.activeRules ?? [] }));
  }, [teams]);

  // Determine which view to show
  // Online: show listening view if it's not your turn; active view if it is
  // Local:  always show active view (all teams on one device)
  const isMyTurn = !isOnlineMode || myTeamIndex === null || myTeamIndex === currentTeamIndex;

  return (
    <>
      <DingSoundListener />
      {isMyTurn ? <ActiveView /> : <ListeningView />}
      <DingReviewModal />
      <RuleRevealModal
        rule={revealRule}
        teamName={revealTeam?.name}
        teamColor={revealTeam?.color?.hex}
        isOpen={!!revealRule}
        onClose={() => { setRevealRule(null); setRevealTeam(null); }}
      />
    </>
  );
}
