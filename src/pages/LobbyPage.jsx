/**
 * LobbyPage — Create or Join a room.
 *
 * Create: pick teams / board / timer → generates room code → host claims team 0
 * Join:   enter code → picks team slot → waits for game state from Firebase
 *
 * In local mode (no Firebase) the join tab still works but shows a note that
 * all teams must use the same device.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, KeyRound, Users, ArrowLeft, Hash, Clock, ChevronRight, Wifi, WifiOff, Zap, Bell } from "lucide-react";
import { useGameStore, GAME_PHASES, DEFAULT_BOARD_LENGTH, DEFAULT_TIMER_SECONDS } from "../store/gameStore";
import { useDevice } from "../context/DeviceContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { isOnlineMode } from "../lib/firebase";

const BOARD_PRESETS = [
  { label: "Short",   value: 20, est: "~20 min" },
  { label: "Classic", value: 30, est: "~35 min" },
  { label: "Long",    value: 50, est: "~60 min" },
];

const TIMER_PRESETS = [
  { label: "30s", value: 30 },
  { label: "45s", value: 45 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
];

function TogglePill({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
            value === opt.value
              ? "bg-sky-600 border-sky-600 text-white shadow-sm"
              : "bg-white border-sky-100 text-sky-400 hover:border-sky-300"
          }`}
        >
          {opt.label}
          {opt.est && <span className="block text-[10px] opacity-60 font-normal">{opt.est}</span>}
          {opt.desc && <span className="block text-[10px] opacity-60 font-normal">{opt.desc}</span>}
        </button>
      ))}
    </div>
  );
}

export function LobbyPage() {
  const [tab, setTab]               = useState("create");
  const [numTeams, setNumTeams]     = useState(2);
  const [boardLength, setBoardLength] = useState(DEFAULT_BOARD_LENGTH);
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_SECONDS);
  const [autoDing, setAutoDing]     = useState(false);
  const [joinCode, setJoinCode]     = useState("");
  const [joinError, setJoinError]   = useState("");

  const createRoom = useGameStore((s) => s.createRoom);
  const joinRoom   = useGameStore((s) => s.joinRoom);
  const setPhase   = useGameStore((s) => s.setPhase);
  const { claimTeam } = useDevice();

  const handleCreate = () => {
    createRoom({ numTeams, boardLength, timerSeconds, autoDing });
    claimTeam(0, true); // host = team 0
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) {
      setJoinError("Room codes are exactly 4 characters (e.g. X7KP)");
      return;
    }
    setJoinError("");
    joinRoom(code);
    // Team selection happens on the TeamSetupPage after state loads from Firebase
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <button
          onClick={() => setPhase(GAME_PHASES.LANDING)}
          className="flex items-center gap-1.5 text-sky-400 hover:text-sky-600 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="bg-white rounded-3xl border border-sky-100 shadow-md p-7"
        >
          {/* Mode badge */}
          <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold mb-5 ${
            isOnlineMode ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
          }`}>
            {isOnlineMode ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isOnlineMode ? "Multiplayer — each team uses their own device" : "Local mode — one shared device"}
          </div>

          <h1 className="font-display text-3xl text-sky-950 mb-5">
            {tab === "create" ? "New Game" : "Join Game"}
          </h1>

          {/* Tab switcher */}
          <div className="flex gap-2 rounded-2xl bg-sky-50 p-1.5 mb-6">
            {[
              { id: "create", label: "Create", icon: Gamepad2 },
              { id: "join",   label: "Join",   icon: KeyRound  },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  tab === t.id
                    ? "bg-sky-600 text-white shadow-sm"
                    : "text-sky-400 hover:text-sky-600"
                }`}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "create" ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                className="space-y-5"
              >
                {/* Teams */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5 mb-2">
                    <Users size={12} /> Number of Teams
                  </label>
                  <TogglePill
                    options={[2,3,4,5,6].map((n) => ({ label: n, value: n }))}
                    value={numTeams}
                    onChange={setNumTeams}
                  />
                </div>

                {/* Board */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-2 block">
                    Board Length
                  </label>
                  <TogglePill options={BOARD_PRESETS} value={boardLength} onChange={setBoardLength} />
                </div>

                {/* Timer */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5 mb-2">
                    <Clock size={12} /> Turn Timer
                  </label>
                  <TogglePill options={TIMER_PRESETS} value={timerSeconds} onChange={setTimerSeconds} />
                </div>

                {/* Instant Ding toggle */}
                <div>
                  <div className="flex items-center justify-between rounded-2xl bg-sky-50 border border-sky-100 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${autoDing ? "bg-red-100" : "bg-sky-100"}`}>
                        {autoDing ? <Zap size={16} className="text-red-500" /> : <Bell size={16} className="text-sky-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-sky-900">Instant Ding</p>
                        <p className="text-xs text-sky-400">
                          {autoDing ? "Ding scores automatically — no host confirmation" : "Host reviews each ding before scoring"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAutoDing((v) => !v)}
                      className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${autoDing ? "bg-red-500" : "bg-sky-200"}`}
                      aria-label="Toggle instant ding"
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                        style={{ left: autoDing ? "calc(100% - 1.375rem)" : "0.125rem" }}
                      />
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-sky-50 p-4 text-center text-sm text-sky-500">
                  <div><p className="font-display text-2xl text-sky-900">{numTeams}</p><p>Teams</p></div>
                  <div><p className="font-display text-2xl text-sky-900">{boardLength}</p><p>Spaces</p></div>
                  <div><p className="font-display text-2xl text-sky-900">{timerSeconds}s</p><p>Timer</p></div>
                </div>

                <Button size="lg" variant="primary" className="w-full" onClick={handleCreate} icon={ChevronRight}>
                  Create Room
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                className="space-y-4"
              >
                {!isOnlineMode && (
                  <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-amber-700 text-sm">
                    <p className="font-bold mb-1">Local mode</p>
                    <p className="text-amber-600/80">Firebase isn't configured, so all teams share this device. Enter any 4-character code to restore a session.</p>
                  </div>
                )}

                <Input
                  label="Room Code"
                  placeholder="e.g. X7KP"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                  error={joinError}
                  icon={Hash}
                  className="text-center text-2xl font-display tracking-[0.3em]"
                  maxLength={4}
                />

                <Button size="lg" variant="primary" className="w-full" onClick={handleJoin} icon={KeyRound}>
                  Join Room
                </Button>

                <p className="text-center text-sky-400 text-sm">
                  No code?{" "}
                  <button onClick={() => setTab("create")} className="text-sky-600 font-bold hover:underline">
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
