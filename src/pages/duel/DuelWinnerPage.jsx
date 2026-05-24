/**
 * DuelWinnerPage — celebration screen for duel mode.
 */

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { useDuelStore } from "../../store/duelStore";
import { useDevice } from "../../context/DeviceContext";
import { Button } from "../../components/ui/Button";

function launch() {
  const colors = ["#7c3aed", "#8b5cf6", "#0ea5e9", "#06b6d4", "#f59e0b", "#10b981"];
  confetti({ particleCount: 140, spread: 180, origin: { x: 0.5, y: 0.55 }, colors });
  const end = Date.now() + 4000;
  const tick = () => {
    confetti({ particleCount: 4, angle: 60,  spread: 70, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(tick);
  };
  tick();
}

export function DuelWinnerPage() {
  const winnerPlayerId = useDuelStore((s) => s.winnerPlayerId);
  const players        = useDuelStore((s) => s.players);
  const boardLength    = useDuelStore((s) => s.boardLength);
  const playAgain      = useDuelStore((s) => s.playAgain);
  const goHome         = useDuelStore((s) => s.goHome);
  const { clearDevice } = useDevice();

  const winner  = players.find((p) => p.id === winnerPlayerId);
  const loser   = players.find((p) => p.id !== winnerPlayerId);
  const sorted  = [...players].sort((a, b) => b.position - a.position);

  useEffect(() => { launch(); }, []);

  const handlePlayAgain = () => { playAgain(); };
  const handleMenu      = () => { goHome(); clearDevice(); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width:  160 + i * 60,
              height: 160 + i * 60,
              background: "#7c3aed",
              top:  `${10 + i * 16}%`,
              left: `${(i % 3) * 35}%`,
              filter: "blur(90px)",
              opacity: 0.06,
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-sm w-full">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-violet-100 mb-5 shadow-lg shadow-violet-200"
        >
          <Trophy size={48} className="text-violet-500 fill-violet-200" />
        </motion.div>

        {/* Winner */}
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, type: "spring" }}>
          <p className="text-violet-500 text-sm font-bold uppercase tracking-widest mb-2">Winner!</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-5xl">{winner?.emoji}</span>
            <h1 className="font-display text-5xl text-sky-950">{winner?.name}</h1>
          </div>
          <p className="text-sky-400">Reached the finish line first!</p>
        </motion.div>

        {/* Score card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="mt-8 bg-white rounded-3xl border border-sky-100 shadow-sm p-5"
        >
          <h2 className="font-display text-xl text-sky-700 mb-4">Final Score</h2>
          <div className="space-y-3">
            {sorted.map((player, i) => {
              const isW = player.id === winnerPlayerId;
              const pct = Math.min((player.position / boardLength) * 100, 100);
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className={`flex items-center gap-3 rounded-2xl p-3 border ${
                    isW ? "border-violet-300 bg-violet-50" : "border-sky-100 bg-sky-50/50"
                  }`}
                >
                  <span className="font-bold text-sky-300 w-5 text-center">{i + 1}</span>
                  <span className="text-2xl">{player.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm text-sky-900">{player.name}</p>
                    <div className="h-1.5 rounded-full bg-sky-100 mt-1 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: isW ? "#7c3aed" : "#0ea5e9" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.85 + i * 0.1, duration: 0.7 }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-sky-300 font-mono">{player.position}/{boardLength}</span>
                  {isW && <Trophy size={16} className="text-violet-500 fill-violet-200" />}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="flex gap-3 mt-7"
        >
          <Button size="lg" className="flex-1 !bg-violet-600 hover:!bg-violet-700 !border-violet-500 !shadow-violet-200"
            onClick={handlePlayAgain} icon={RotateCcw}
          >
            Play Again
          </Button>
          <Button size="lg" variant="secondary" className="flex-1" onClick={handleMenu} icon={Home}>
            Menu
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
