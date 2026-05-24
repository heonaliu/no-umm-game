/**
 * LobbyPage — Create a new game OR join with a room code.
 *
 * Create flow: choose # teams, board length, timer → generate room code
 * Join flow: enter room code (local sim — in real app would fetch server state)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, GAME_PHASES, DEFAULT_BOARD_LENGTH, DEFAULT_TIMER_SECONDS } from "../store/gameStore";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";

const BOARD_PRESETS = [
  { label: "Short",   value: 20, desc: "~20 min" },
  { label: "Classic", value: 30, desc: "~35 min" },
  { label: "Long",    value: 50, desc: "~60 min" },
];

const TIMER_PRESETS = [
  { label: "30s", value: 30 },
  { label: "45s", value: 45 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
];

export function LobbyPage() {
  const [tab, setTab] = useState("create"); // "create" | "join"
  const [numTeams, setNumTeams] = useState(2);
  const [boardLength, setBoardLength] = useState(DEFAULT_BOARD_LENGTH);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_SECONDS);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");

  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom = useGameStore((s) => s.joinRoom);
  const setPhase = useGameStore((s) => s.setPhase);

  const handleCreate = () => {
    createRoom({ numTeams, boardLength, timerSeconds });
  };

  const handleJoin = () => {
    if (joinCode.trim().length !== 4) {
      setJoinError("Room codes are 4 characters (e.g. X7KP)");
      return;
    }
    setJoinError("");
    joinRoom(joinCode.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Back button */}
        <button
          onClick={() => setPhase(GAME_PHASES.LANDING)}
          className="text-white/40 hover:text-white/80 text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 25 }}
        >
          <h1 className="font-display text-4xl text-white text-shadow mb-6 text-center">
            {tab === "create" ? "🎮 New Game" : "🔑 Join Game"}
          </h1>

          {/* Tab switcher */}
          <div className="flex gap-2 rounded-2xl bg-white/5 p-1.5 mb-6">
            {["create", "join"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`
                  flex-1 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 capitalize
                  ${tab === t
                    ? "bg-violet-600 text-white shadow-lg"
                    : "text-white/50 hover:text-white/80"
                  }
                `}
              >
                {t === "create" ? "🎮 Create" : "🔑 Join"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "create" ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                {/* Number of teams */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 block mb-2">
                    Number of Teams
                  </label>
                  <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map((n) => (
                      <button
                        key={n}
                        onClick={() => setNumTeams(n)}
                        className={`
                          flex-1 py-3 rounded-xl font-display font-bold text-lg border-2 transition-all
                          ${numTeams === n
                            ? "bg-violet-600 border-violet-400 text-white"
                            : "bg-white/5 border-white/15 text-white/60 hover:border-white/30"
                          }
                        `}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Board length */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 block mb-2">
                    Board Length
                  </label>
                  <div className="flex gap-2">
                    {BOARD_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setBoardLength(p.value)}
                        className={`
                          flex-1 py-3 rounded-xl font-bold border-2 transition-all text-sm
                          ${boardLength === p.value
                            ? "bg-cyan-600 border-cyan-400 text-white"
                            : "bg-white/5 border-white/15 text-white/60 hover:border-white/30"
                          }
                        `}
                      >
                        <div>{p.label}</div>
                        <div className="text-xs opacity-70">{p.value} spaces</div>
                        <div className="text-xs opacity-50">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timer */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-white/50 block mb-2">
                    Turn Timer
                  </label>
                  <div className="flex gap-2">
                    {TIMER_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setTimerSeconds(p.value)}
                        className={`
                          flex-1 py-3 rounded-xl font-display font-bold border-2 transition-all
                          ${timerSeconds === p.value
                            ? "bg-pink-600 border-pink-400 text-white"
                            : "bg-white/5 border-white/15 text-white/60 hover:border-white/30"
                          }
                        `}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-sm text-white/60 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-display text-white">{numTeams}</div>
                    <div>Teams</div>
                  </div>
                  <div>
                    <div className="text-2xl font-display text-white">{boardLength}</div>
                    <div>Spaces</div>
                  </div>
                  <div>
                    <div className="text-2xl font-display text-white">{timerSeconds}s</div>
                    <div>Per Turn</div>
                  </div>
                </div>

                <Button size="lg" variant="primary" className="w-full" onClick={handleCreate}>
                  🚀 Create Room
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300 text-sm">
                  <p className="font-bold mb-1">📱 Local Play Mode</p>
                  <p className="text-amber-300/70">
                    This is a local-play game — everyone gathers around one device (or a shared screen).
                    Room codes are for identifying sessions when you navigate back.
                  </p>
                </div>

                <Input
                  label="Room Code"
                  placeholder="Enter 4-letter code (e.g. X7KP)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                  error={joinError}
                  className="text-center text-2xl font-display tracking-[0.3em]"
                  maxLength={4}
                />

                <Button size="lg" variant="primary" className="w-full" onClick={handleJoin}>
                  🔑 Join Room
                </Button>

                <p className="text-center text-white/30 text-sm">
                  Don't have a code?{" "}
                  <button
                    onClick={() => setTab("create")}
                    className="text-violet-400 hover:text-violet-300 underline"
                  >
                    Create a new game
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
