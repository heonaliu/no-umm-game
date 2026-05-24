/**
 * DuelGameplayPage — 1v1 head-to-head gameplay screen.
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  SPEAKER DEVICE                                     │
 * │  Dual progress board  │  Large timer + Word card    │
 * │                       │  ✓ Correct! · Skip (n left) │
 * │                       │  Active rules               │
 * └─────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  LISTENER DEVICE (online mode)                      │
 * │  Giant DING button + read-only timer                │
 * │  Compact progress board                             │
 * └─────────────────────────────────────────────────────┘
 *
 * In local mode, the combined view is shown on one device.
 * DING auto-confirms in duel (no host review needed).
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Bell, Play, Timer, ChevronRight, Flame, SkipForward, Flag, Mic } from "lucide-react";
import { useDuelStore, DUEL_TURN_PHASES, isDangerZone } from "../../store/duelStore";
import { useDevice } from "../../context/DeviceContext";
import { isOnlineMode } from "../../lib/firebase";
import { burstConfetti } from "../../hooks/useConfetti";
import { useDuelTimer } from "../../hooks/useDuelTimer";
import { playDing } from "../../utils/sounds";

import { CountdownTimer }       from "../../components/game/CountdownTimer";
import { DuelProgressBoard }    from "../../components/board/DuelProgressBoard";

// ─── Ding sound effect (watches dingCount) ────────────────────────────────────

function DingSoundListener() {
  const dingCount = useDuelStore((s) => s.dingCount);
  useEffect(() => { if (dingCount > 0) playDing(); }, [dingCount]);
  return null;
}

// ─── Listener view (non-active player, online mode) ──────────────────────────

function ListenerView({ onRequestEnd }) {
  const players           = useDuelStore((s) => s.players);
  const activePlayerIndex = useDuelStore((s) => s.activePlayerIndex);
  const turnPhase         = useDuelStore((s) => s.turnPhase);
  const boardLength       = useDuelStore((s) => s.boardLength);
  const pressDing         = useDuelStore((s) => s.pressDing);
  const remaining         = useDuelTimer();
  const timerSeconds      = useDuelStore((s) => s.timerSeconds);

  const speaker    = players[activePlayerIndex];
  const isDescribing = turnPhase === DUEL_TURN_PHASES.DESCRIBING;
  const inDanger   = isDangerZone(speaker?.position ?? 0, boardLength);

  return (
    <div className="min-h-screen flex flex-col p-4 gap-4 max-w-lg mx-auto">
      {/* Speaker info */}
      <div className="rounded-2xl bg-white border border-sky-100 p-4 flex items-center gap-3 shadow-sm">
        <span className="text-3xl">{speaker?.emoji}</span>
        <div>
          <p className="text-xs text-violet-500 font-bold uppercase tracking-widest">Speaking now</p>
          <p className="font-display text-lg text-sky-900">{speaker?.name}</p>
        </div>
        <div className="ml-auto">
          <CountdownTimer remaining={remaining} timerSeconds={timerSeconds} />
        </div>
      </div>

      {inDanger && isDescribing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-red-300 bg-red-50 p-3 flex items-center gap-2 text-red-600 text-sm font-bold"
        >
          <Flame size={16} /> DANGER ZONE — no um/uh from EITHER player!
        </motion.div>
      )}

      {/* Giant DING button */}
      <motion.button
        onClick={() => isDescribing && pressDing()}
        disabled={!isDescribing}
        whileTap={isDescribing ? { scale: 0.92 } : {}}
        whileHover={isDescribing ? { scale: 1.02 } : {}}
        transition={{ type: "spring", stiffness: 380, damping: 16 }}
        className={`
          flex-1 min-h-[300px] rounded-3xl border-4 flex flex-col items-center justify-center gap-4
          font-display text-4xl select-none transition-all cursor-pointer
          ${isDescribing
            ? "bg-red-600 border-red-500 text-white shadow-xl shadow-red-200"
            : turnPhase === DUEL_TURN_PHASES.DING_REVIEW
              ? "bg-red-100 border-red-200 text-red-400"
              : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
          }
        `}
      >
        <motion.div
          animate={isDescribing ? { rotate: [-8, 8, -5, 5, 0] } : {}}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1 }}
        >
          <Bell size={80} className={isDescribing ? "text-white fill-white/20" : "text-current"} />
        </motion.div>
        <span>
          {isDescribing ? "DING!" : turnPhase === DUEL_TURN_PHASES.DING_REVIEW ? "Dinged! ✓" : "Waiting"}
        </span>
        <p className="text-base font-body opacity-70">Tap if they say um, uh, or break a rule</p>
      </motion.button>

      {!isDescribing && turnPhase !== DUEL_TURN_PHASES.DING_REVIEW && (
        <p className="text-center text-sm text-sky-300">
          {turnPhase === DUEL_TURN_PHASES.IDLE ? "Waiting for speaker to start…"
          : turnPhase === DUEL_TURN_PHASES.TURN_END ? "Turn over — waiting for next turn…"
          : ""}
        </p>
      )}

      <DuelProgressBoard />

      <div className="flex justify-center">
        <button onClick={onRequestEnd}
          className="text-xs text-sky-300 hover:text-red-400 transition-colors flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-red-50 cursor-pointer"
        >
          <Flag size={13} /> End Duel
        </button>
      </div>
    </div>
  );
}

// ─── Speaker view (active player) ────────────────────────────────────────────

function SpeakerView({ onRequestEnd }) {
  const players           = useDuelStore((s) => s.players);
  const activePlayerIndex = useDuelStore((s) => s.activePlayerIndex);
  const turnPhase         = useDuelStore((s) => s.turnPhase);
  const boardLength       = useDuelStore((s) => s.boardLength);
  const skipLimit         = useDuelStore((s) => s.skipLimit);
  const skipsThisTurn     = useDuelStore((s) => s.skipsThisTurn);
  const currentWordPair   = useDuelStore((s) => s.currentWordPair);
  const startTurn         = useDuelStore((s) => s.startTurn);
  const scoreCorrect      = useDuelStore((s) => s.scoreCorrect);
  const skipWord          = useDuelStore((s) => s.skipWord);
  const endTurn           = useDuelStore((s) => s.endTurn);
  const pressDing         = useDuelStore((s) => s.pressDing);
  const remaining         = useDuelTimer();
  const timerSeconds      = useDuelStore((s) => s.timerSeconds);

  const speaker       = players[activePlayerIndex];
  const listenerIndex = 1 - activePlayerIndex;
  const listener      = players[listenerIndex];
  const inDanger      = isDangerZone(speaker?.position ?? 0, boardLength);
  const canSkip       = skipLimit === 99 || skipsThisTurn < skipLimit;
  const skipsLeft     = skipLimit === 99 ? null : skipLimit - skipsThisTurn;
  const isDescribing  = turnPhase === DUEL_TURN_PHASES.DESCRIBING;
  const isDingReview  = turnPhase === DUEL_TURN_PHASES.DING_REVIEW;

  const handleCorrect = () => {
    burstConfetti({ x: 0.5, y: 0.6 });
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
            DANGER ZONE — Neither player may say "um" or "uh"!
            <Flame size={16} className="animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-4 max-w-6xl mx-auto">
        {/* Left: progress board */}
        <div className="flex-1 min-w-0">
          <DuelProgressBoard />

          {/* Rules for speaker */}
          {speaker?.activeRules?.length > 0 && (
            <div className="mt-3 rounded-2xl bg-amber-50 border border-amber-200 p-3">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Your Active Rules</p>
              <div className="space-y-1">
                {speaker.activeRules.map((rule) => (
                  <div key={rule.id} className="flex items-start gap-2 text-sm">
                    <span>{rule.emoji}</span>
                    <div>
                      <span className="font-bold text-sky-900">{rule.title}</span>
                      <span className="text-sky-500 ml-2 text-xs">{rule.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: turn controls */}
        <div className="lg:w-[380px] shrink-0 space-y-4">
          {/* Speaker badge */}
          <motion.div
            key={activePlayerIndex}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border-2 border-violet-200 p-4 text-center bg-white shadow-sm"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-1">Speaking</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-4xl">{speaker?.emoji}</span>
              <h2 className="font-display text-3xl text-sky-950">{speaker?.name}</h2>
            </div>
            <p className="text-sky-300 text-xs mt-1">vs {listener?.emoji} {listener?.name}</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* IDLE — start turn */}
            {turnPhase === DUEL_TURN_PHASES.IDLE && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="rounded-2xl bg-violet-50 border border-violet-100 p-5 text-center text-sky-600 text-sm">
                  <Mic size={28} className="mx-auto mb-3 text-violet-400" />
                  <p>
                    <strong className="text-sky-900">{speaker?.name}</strong> is speaking this turn.
                    Describe the word pairs — the listener will guess!
                  </p>
                  {inDanger && (
                    <p className="mt-2 text-red-500 text-xs font-bold">
                      ⚠️ Danger Zone — neither player can say um/uh!
                    </p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  onClick={startTurn}
                  className="w-full rounded-2xl border-2 border-violet-500 bg-violet-600 hover:bg-violet-700 py-4 px-4 font-display text-xl text-white shadow-md shadow-violet-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play size={20} /> Start Turn
                </motion.button>
              </motion.div>
            )}

            {/* DESCRIBING / DING_REVIEW */}
            {(isDescribing || isDingReview) && (
              <motion.div
                key="describing"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Timer + word */}
                <div className="flex items-start gap-3">
                  <CountdownTimer large remaining={remaining} timerSeconds={timerSeconds} />
                  <div className="flex-1">
                    {currentWordPair && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentWordPair.key}
                          initial={{ rotateX: -80, opacity: 0 }}
                          animate={{ rotateX: 0, opacity: 1 }}
                          exit={{ rotateX: 80, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          style={{ transformStyle: "preserve-3d" }}
                          className="rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-sky-50 p-4 text-center shadow-md"
                        >
                          <p className="text-[9px] uppercase tracking-[0.2em] text-violet-400 mb-1">Word A</p>
                          <p className="font-display text-2xl text-sky-950 mb-2">{currentWordPair.wordA}</p>
                          <div className="h-px bg-violet-200 mb-2" />
                          <p className="text-[9px] uppercase tracking-[0.2em] text-violet-400 mb-1">Word B</p>
                          <p className="font-display text-2xl text-sky-950">{currentWordPair.wordB}</p>
                          <p className="mt-3 text-[10px] text-sky-300">Describe both in order!</p>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                {/* DING feedback */}
                <AnimatePresence>
                  {isDingReview && (
                    <motion.div
                      key="ding-fb"
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="rounded-2xl bg-red-50 border-2 border-red-200 p-3 text-center flex items-center justify-center gap-2 text-red-600 font-bold"
                    >
                      <Bell size={18} className="fill-red-300" />
                      DING! {listener?.name} gets +1
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Correct button */}
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleCorrect}
                  disabled={!isDescribing}
                  className="w-full rounded-2xl border-2 border-emerald-300 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed py-5 px-4 font-display text-xl text-white shadow-md shadow-emerald-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle size={22} /> Correct! +1 Space
                </motion.button>

                {/* Skip button */}
                <button
                  onClick={skipWord}
                  disabled={!isDescribing || !canSkip}
                  className="w-full rounded-2xl border-2 border-sky-200 bg-sky-50 hover:bg-sky-100 disabled:opacity-40 disabled:cursor-not-allowed py-3 px-4 font-display text-base text-sky-600 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <SkipForward size={18} />
                  Skip Word
                  {skipLimit !== 99 && (
                    <span className="text-xs text-sky-400 ml-1">
                      ({skipsLeft} left)
                    </span>
                  )}
                </button>

                <p className="text-xs text-sky-300 text-center">
                  Tap ✓ after both words guessed in order · Skip if stuck
                </p>

                {/* Local-mode DING button for listener */}
                {!isOnlineMode && (
                  <div className="pt-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-sky-300 text-center mb-2">
                      <Bell size={11} className="inline mr-1" />
                      {listener?.name} — tap DING to flag a violation
                    </p>
                    <motion.button
                      onClick={() => isDescribing && pressDing()}
                      disabled={!isDescribing}
                      whileTap={isDescribing ? { scale: 0.94 } : {}}
                      className={`w-full rounded-2xl border-2 py-4 font-display text-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        isDescribing
                          ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-100"
                          : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <Bell size={20} className={isDescribing ? "fill-white/20" : ""} />
                      DING — {listener?.emoji} {listener?.name}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {/* TURN END */}
            {turnPhase === DUEL_TURN_PHASES.TURN_END && (
              <motion.div
                key="end"
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-5 text-center">
                  <Timer size={36} className="mx-auto mb-2 text-sky-400" />
                  <h2 className="font-display text-2xl text-sky-900 mb-1">Time's Up!</h2>
                  <p className="text-sky-500 text-sm">
                    {speaker?.name}'s turn is over. Now it's{" "}
                    <strong className="text-sky-900">{listener?.name}'s</strong> turn to speak!
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                  onClick={endTurn}
                  className="w-full rounded-2xl border-2 border-violet-500 bg-violet-600 hover:bg-violet-700 py-4 font-display text-lg text-white shadow-md shadow-violet-100 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <ChevronRight size={20} /> {listener?.emoji} {listener?.name}'s Turn
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center pt-1">
            <button onClick={onRequestEnd}
              className="text-xs text-sky-300 hover:text-red-400 transition-colors flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-red-50 cursor-pointer"
            >
              <Flag size={13} /> End Duel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function DuelGameplayPage() {
  const players           = useDuelStore((s) => s.players);
  const activePlayerIndex = useDuelStore((s) => s.activePlayerIndex);
  const turnPhase         = useDuelStore((s) => s.turnPhase);
  const confirmDing       = useDuelStore((s) => s.confirmDing);
  const goHome            = useDuelStore((s) => s.goHome);
  const { myTeamIndex, clearDevice } = useDevice();

  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // Auto-confirm DING after brief visual pause (800ms)
  const confirmTimerRef = useRef(null);
  useEffect(() => {
    if (turnPhase === DUEL_TURN_PHASES.DING_REVIEW) {
      confirmTimerRef.current = setTimeout(() => {
        confirmDing();
      }, 800);
    }
    return () => clearTimeout(confirmTimerRef.current);
  }, [turnPhase, confirmDing]);

  const handleEndGame = () => {
    goHome();
    clearDevice();
    setShowEndConfirm(false);
  };

  // Speaker vs listener split
  const isMyTurn = !isOnlineMode || myTeamIndex === null || myTeamIndex === activePlayerIndex;

  return (
    <>
      <DingSoundListener />

      {isMyTurn
        ? <SpeakerView  onRequestEnd={() => setShowEndConfirm(true)} />
        : <ListenerView onRequestEnd={() => setShowEndConfirm(true)} />
      }

      {/* End duel confirmation modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <>
            <motion.div
              key="end-bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-sky-950/40 backdrop-blur-sm z-50"
              onClick={() => setShowEndConfirm(false)}
            />
            <motion.div
              key="end-panel"
              initial={{ opacity: 0, scale: 0.85, y: 32 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 32 }}
              transition={{ type: "spring", stiffness: 400, damping: 26 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-sm rounded-3xl bg-white border-2 border-red-200 shadow-2xl shadow-red-50 p-7 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
                  <Flag size={28} className="text-red-500" />
                </div>
                <h2 className="font-display text-2xl text-sky-950 mb-2">End the duel?</h2>
                <p className="text-sky-500 text-sm mb-6">
                  This will discard all progress and return to the main menu.
                  {isOnlineMode && " Both players will be sent back."}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setShowEndConfirm(false)}
                    className="flex-1 py-3 rounded-2xl border-2 border-sky-200 text-sky-600 font-bold text-sm hover:bg-sky-50 transition-colors cursor-pointer"
                  >Keep Playing</button>
                  <button onClick={handleEndGame}
                    className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors cursor-pointer"
                  >End Duel</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
