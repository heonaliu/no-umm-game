/**
 * WinnerPage — celebration screen with confetti + leaderboard.
 */

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Trophy, Crown, RotateCcw, Home } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { useDevice } from "../context/DeviceContext";
import { Button } from "../components/ui/Button";

function launch() {
  const end = Date.now() + 4500;
  const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ec4899"];

  confetti({ particleCount: 140, spread: 180, origin: { x: 0.5, y: 0.55 }, colors });

  const tick = () => {
    confetti({ particleCount: 4, angle: 60,  spread: 70, origin: { x: 0, y: 0.7 }, colors });
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors });
    if (Date.now() < end) requestAnimationFrame(tick);
  };
  tick();
}

export function WinnerPage() {
  const winnerTeamId = useGameStore((s) => s.winnerTeamId);
  const teams        = useGameStore((s) => s.teams);
  const boardLength  = useGameStore((s) => s.boardLength);
  const resetGame    = useGameStore((s) => s.resetGame);
  const { clearDevice } = useDevice();

  const winner      = teams.find((t) => t.id === winnerTeamId);
  const sorted      = [...teams].sort((a, b) => b.position - a.position);

  useEffect(() => { launch(); }, []);

  const handleReset = () => { resetGame(); clearDevice(); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width:  160 + i * 80,
              height: 160 + i * 80,
              background: winner?.color?.hex ?? "#6366f1",
              top:  `${10 + i * 15}%`,
              left: `${(i % 3) * 35}%`,
              filter: "blur(90px)",
              opacity: 0.06,
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.2 }}
          className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-amber-100 mb-5 shadow-lg shadow-amber-200"
        >
          <Trophy size={48} className="text-amber-500 fill-amber-200" />
        </motion.div>

        {/* Winner */}
        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, type: "spring" }}
        >
          <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-2">Winner!</p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-5xl">{winner?.pawn}</span>
            <h1 className="font-display text-5xl" style={{ color: winner?.color?.hex }}>
              {winner?.name}
            </h1>
          </div>
          <p className="text-indigo-400">Reached the finish line first!</p>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mt-8 bg-white rounded-3xl border border-indigo-100 shadow-sm p-5"
        >
          <h2 className="font-display text-xl text-indigo-700 mb-4">Final Standings</h2>
          <div className="space-y-2.5">
            {sorted.map((team, i) => {
              const isWinner = team.id === winnerTeamId;
              const pct = Math.min((team.position / boardLength) * 100, 100);
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.85 + i * 0.09 }}
                  className={`flex items-center gap-3 rounded-2xl p-3 border ${
                    isWinner ? "border-amber-300 bg-amber-50" : "border-indigo-100 bg-indigo-50/50"
                  }`}
                >
                  <span className="font-bold text-indigo-300 w-5 text-center">{i + 1}</span>
                  <span className="text-2xl">{team.pawn}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm" style={{ color: team.color?.hex }}>{team.name}</p>
                    <div className="h-1.5 rounded-full bg-indigo-100 mt-1 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: team.color?.hex }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.9 + i * 0.09, duration: 0.7 }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-indigo-300 font-mono">{team.position}/{boardLength}</span>
                  {isWinner && <Crown size={18} className="text-amber-500 fill-amber-200" />}
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
          <Button size="lg" variant="primary" className="flex-1" onClick={handleReset} icon={RotateCcw}>
            Play Again
          </Button>
          <Button size="lg" variant="secondary" className="flex-1" onClick={handleReset} icon={Home}>
            Menu
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
