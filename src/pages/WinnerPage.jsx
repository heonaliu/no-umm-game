/**
 * WinnerPage — celebration screen when a team reaches the end.
 * Full-screen confetti + trophy display + team stats.
 */

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useGameStore } from "../store/gameStore";
import { Button } from "../components/ui/Button";

function launchWinnerConfetti() {
  const duration = 5000;
  const animEnd = Date.now() + duration;

  const tick = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0.7 },
      colors: ["#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#10b981"],
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0.7 },
      colors: ["#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#10b981"],
    });

    if (Date.now() < animEnd) {
      requestAnimationFrame(tick);
    }
  };

  tick();

  // Big burst up front
  confetti({
    particleCount: 150,
    spread: 180,
    origin: { x: 0.5, y: 0.5 },
    colors: ["#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#10b981"],
  });
}

export function WinnerPage() {
  const winnerTeamId = useGameStore((s) => s.winnerTeamId);
  const teams = useGameStore((s) => s.teams);
  const boardLength = useGameStore((s) => s.boardLength);
  const resetGame = useGameStore((s) => s.resetGame);

  const winner = teams.find((t) => t.id === winnerTeamId);
  const sortedTeams = [...teams].sort((a, b) => b.position - a.position);

  useEffect(() => {
    launchWinnerConfetti();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 100 + Math.random() * 200,
              height: 100 + Math.random() * 200,
              background: winner?.color?.hex ?? "#8b5cf6",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: "blur(80px)",
              opacity: 0.08,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        {/* Trophy animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="text-9xl mb-4"
        >
          🏆
        </motion.div>

        {/* Winner announcement */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <p className="text-white/50 text-lg mb-2 uppercase tracking-widest font-bold">
            Winner!
          </p>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-5xl">{winner?.pawn}</span>
            <h1
              className="font-display text-6xl text-shadow-lg"
              style={{ color: winner?.color?.hex }}
            >
              {winner?.name}
            </h1>
          </div>
          <p className="text-white/40 text-lg">
            Reached the finish line! 🎉
          </p>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-sm p-5"
        >
          <h2 className="font-display text-xl text-white/70 mb-4">Final Standings</h2>
          <div className="space-y-3">
            {sortedTeams.map((team, i) => {
              const isWinner = team.id === winnerTeamId;
              const pct = Math.min((team.position / boardLength) * 100, 100);
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  className={`flex items-center gap-3 rounded-2xl p-3 border ${
                    isWinner
                      ? "border-yellow-400/40 bg-yellow-400/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <span className="text-white/40 font-bold w-6 text-center">{i + 1}</span>
                  <span className="text-2xl">{team.pawn}</span>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-display text-sm font-bold truncate"
                      style={{ color: team.color?.hex }}
                    >
                      {team.name}
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 mt-1 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: team.color?.hex }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 1 + i * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                  <span className="text-white/50 text-sm font-mono shrink-0">
                    {team.position}/{boardLength}
                  </span>
                  {isWinner && <span className="text-yellow-400">👑</span>}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <Button size="lg" variant="primary" className="flex-1" onClick={resetGame}>
            🎮 Play Again
          </Button>
          <Button size="lg" variant="secondary" className="flex-1" onClick={resetGame}>
            🏠 Main Menu
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
