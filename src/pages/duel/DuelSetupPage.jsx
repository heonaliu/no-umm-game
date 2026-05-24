/**
 * DuelSetupPage — player name / emoji customisation before the duel starts.
 *
 * Online mode: each player edits their own slot on their device, then the
 *              host (Player 1) starts when both are ready.
 * Local mode:  one device edits both players, then starts immediately.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ChevronRight, Lock, Pencil, XCircle } from "lucide-react";
import { useDuelStore, DUEL_PHASES } from "../../store/duelStore";
import { useDevice } from "../../context/DeviceContext";
import { Button } from "../../components/ui/Button";
import { isOnlineMode } from "../../lib/firebase";

const EMOJI_OPTIONS = [
  "🐉","🦊","🐺","🦁","🐯","🐻","🦄","🐼",
  "🦋","🐬","🦅","🐙","🦊","🌟","⚡","🔥",
  "🏆","🎯","🚀","💎",
];

function PlayerCard({ player, index, editable }) {
  const updatePlayer = useDuelStore((s) => s.updatePlayer);
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(player.name);

  const save = () => {
    if (name.trim()) updatePlayer(player.id, { name: name.trim() });
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`rounded-3xl border-2 p-5 space-y-4 bg-white shadow-sm ${
        editable ? "border-violet-200" : "border-sky-100 opacity-70"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-4xl">{player.emoji}</span>
        <div className="flex-1 min-w-0">
          {editable && editing ? (
            <div className="flex gap-2">
              <input
                autoFocus value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={save}
                onKeyDown={(e) => e.key === "Enter" && save()}
                maxLength={20}
                className="flex-1 bg-sky-50 border-2 border-sky-300 rounded-xl px-3 py-1.5 text-sky-900 font-display text-xl focus:outline-none"
              />
              <button onClick={save} className="text-sky-600 px-2"><Check size={18} /></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl text-sky-900">{player.name}</span>
              {editable && (
                <button onClick={() => setEditing(true)} className="text-sky-200 hover:text-sky-400">
                  <Pencil size={14} />
                </button>
              )}
            </div>
          )}
          <p className="text-sky-400 text-xs">Player {index + 1}</p>
        </div>
        {!editable && (
          <span className="text-xs text-sky-300 font-medium">waiting…</span>
        )}
      </div>

      {editable && (
        <div>
          <p className="text-xs uppercase tracking-widest text-sky-300 mb-2">Pawn</p>
          <div className="flex flex-wrap gap-2">
            {EMOJI_OPTIONS.map((em) => (
              <button
                key={em}
                onClick={() => updatePlayer(player.id, { emoji: em })}
                className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all border-2 cursor-pointer ${
                  player.emoji === em
                    ? "border-violet-400 bg-violet-50 scale-110"
                    : "border-transparent bg-sky-50/40 hover:bg-sky-50"
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function DuelSetupPage() {
  const players      = useDuelStore((s) => s.players);
  const roomCode     = useDuelStore((s) => s.roomCode);
  const teamClaims   = useDuelStore((s) => s.teamClaims ?? {});
  const boardLength  = useDuelStore((s) => s.boardLength);
  const timerSeconds = useDuelStore((s) => s.timerSeconds);
  const skipLimit    = useDuelStore((s) => s.skipLimit);
  const startTurn    = useDuelStore((s) => s.startTurn);
  const claimSlot    = useDuelStore((s) => s.claimTeamSlot);
  const releaseSlot  = useDuelStore((s) => s.releaseTeamSlot);
  const goHome       = useDuelStore((s) => s.goHome);

  const { deviceId, myTeamIndex, isHost, claimTeam, clearDevice } = useDevice();
  const [copied, setCopied]   = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  const claimedCount   = Object.keys(teamClaims).length;
  const bothReady      = !isOnlineMode || claimedCount >= 2;

  // Re-establish claim on mount (handles refresh)
  useEffect(() => {
    if (!isOnlineMode || !deviceId || myTeamIndex === null) return;
    claimSlot(myTeamIndex, deviceId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleToggleClaim = (idx) => {
    if (myTeamIndex === idx) {
      claimTeam(null, isHost);
      releaseSlot(deviceId);
    } else {
      claimTeam(idx, isHost);
      claimSlot(idx, deviceId);
    }
  };

  const handleStart = () => {
    // Transition phase → GAMEPLAY, then first turn will be started by the speaker
    useDuelStore.setState({ phase: DUEL_PHASES.GAMEPLAY });
    startTurn();
  };

  const handleCancel = () => {
    goHome();
    clearDevice();
  };

  const myPlayerIndex = isOnlineMode ? myTeamIndex : null;

  return (
    <div className="min-h-screen p-4 pb-28">
      <div className="max-w-lg mx-auto">

        <button
          onClick={() => setShowCancel(true)}
          className="flex items-center gap-1.5 text-sky-400 hover:text-red-500 text-sm mt-6 mb-4 transition-colors cursor-pointer"
        >
          <XCircle size={16} /> Cancel Duel
        </button>

        {/* Cancel confirm */}
        <AnimatePresence>
          {showCancel && (
            <>
              <motion.div
                key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-sky-950/40 backdrop-blur-sm z-50"
                onClick={() => setShowCancel(false)}
              />
              <motion.div
                key="modal"
                initial={{ opacity: 0, scale: 0.85, y: 32 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 32 }}
                transition={{ type: "spring", stiffness: 400, damping: 26 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
              >
                <div className="pointer-events-auto w-full max-w-sm rounded-3xl bg-white border-2 border-red-200 shadow-2xl shadow-red-50 p-7 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
                    <XCircle size={28} className="text-red-500" />
                  </div>
                  <h2 className="font-display text-2xl text-sky-950 mb-2">Cancel duel?</h2>
                  <p className="text-sky-500 text-sm mb-6">This will end the session and return to the home screen.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowCancel(false)}
                      className="flex-1 py-3 rounded-2xl border-2 border-sky-200 text-sky-600 font-bold text-sm hover:bg-sky-50 transition-colors cursor-pointer"
                    >Keep Going</button>
                    <button onClick={handleCancel}
                      className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors cursor-pointer"
                    >Yes, Cancel</button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
          {roomCode && (
            <button onClick={copyCode}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-white border border-sky-200 px-4 py-2 mb-4 shadow-sm hover:bg-sky-50 transition-colors cursor-pointer"
            >
              <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">Room Code</span>
              <span className="font-display text-xl text-sky-900 tracking-[0.2em]">{roomCode}</span>
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-sky-300" />}
            </button>
          )}
          <h1 className="font-display text-4xl text-sky-950">Duel Setup</h1>
          <p className="text-sky-400 mt-1 text-sm">Customise your player before the duel</p>

          {/* Game settings recap */}
          <div className="inline-flex gap-4 mt-3 bg-violet-50 rounded-2xl px-5 py-2 text-sm text-sky-600">
            <span><strong className="text-sky-900">{boardLength}</strong> spaces</span>
            <span><strong className="text-sky-900">{timerSeconds}s</strong> turns</span>
            <span><strong className="text-sky-900">{skipLimit === 99 ? "∞" : skipLimit}</strong> skips</span>
          </div>
        </motion.div>

        {/* Claim panel (online) */}
        {isOnlineMode && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 rounded-2xl bg-sky-50 border border-sky-200 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">I am…</p>
            <div className="flex gap-2">
              {players.map((player, i) => {
                const claimedBy = teamClaims[String(i)];
                const isMine    = myTeamIndex === i;
                const isTaken   = claimedBy && claimedBy !== deviceId;
                return (
                  <button
                    key={player.id}
                    onClick={() => !isTaken && handleToggleClaim(i)}
                    disabled={isTaken}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer ${
                      isMine  ? "bg-violet-100 border-violet-400 text-violet-800"
                      : isTaken ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                      : "border-sky-100 bg-white text-sky-500 hover:border-sky-300"
                    }`}
                  >
                    <span>{player.emoji}</span>
                    <span>{player.name}</span>
                    {isMine   && <Check size={14} />}
                    {isTaken  && <Lock  size={12} />}
                  </button>
                );
              })}
            </div>
            {!bothReady && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                Waiting for both players to join… ({claimedCount}/2)
              </p>
            )}
          </motion.div>
        )}

        {/* Player cards */}
        <div className="space-y-4 mb-8">
          {players.map((player, i) => {
            const editable = !isOnlineMode || myPlayerIndex === i;
            return <PlayerCard key={player.id} player={player} index={i} editable={editable} />;
          })}
        </div>

        {/* Start button — host only */}
        {(isHost || !isOnlineMode) && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-sky-50 via-sky-50/90 to-transparent">
            <div className="max-w-lg mx-auto">
              <Button
                size="lg" className="w-full !bg-violet-600 hover:!bg-violet-700 !border-violet-500 !shadow-violet-200"
                disabled={!bothReady}
                onClick={handleStart}
                icon={ChevronRight}
              >
                {bothReady ? "Start Duel!" : `Waiting for opponent… (${claimedCount}/2)`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
