/**
 * DuelLobbyPage — Create or Join a 1v1 Duel room.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Swords, KeyRound, ArrowLeft, Hash, Clock, ChevronRight, Loader2, SkipForward } from "lucide-react";
import { useDuelStore, DEFAULT_DUEL_BOARD, DEFAULT_DUEL_TIMER, DEFAULT_DUEL_SKIPS } from "../../store/duelStore";
import { useDevice } from "../../context/DeviceContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { isOnlineMode } from "../../lib/firebase";
import { duelExists } from "../../lib/duelSync";

const BOARD_PRESETS = [
  { label: "Short",   value: 20, est: "~15 min" },
  { label: "Classic", value: 30, est: "~25 min" },
  { label: "Long",    value: 50, est: "~45 min" },
];

const TIMER_PRESETS = [
  { label: "30s", value: 30 },
  { label: "45s", value: 45 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
];

const SKIP_PRESETS = [
  { label: "1 skip",  value: 1 },
  { label: "2 skips", value: 2 },
  { label: "3 skips", value: 3 },
  { label: "Unlimited", value: 99 },
];

function TogglePill({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all cursor-pointer ${
            value === opt.value
              ? "bg-violet-600 border-violet-600 text-white shadow-sm"
              : "bg-white border-sky-100 text-sky-400 hover:border-sky-300"
          }`}
        >
          {opt.label}
          {opt.est && <span className="block text-[10px] opacity-60 font-normal">{opt.est}</span>}
        </button>
      ))}
    </div>
  );
}

export function DuelLobbyPage() {
  const [tab, setTab]           = useState("create");
  const [boardLength, setBL]    = useState(DEFAULT_DUEL_BOARD);
  const [timerSeconds, setTS]   = useState(DEFAULT_DUEL_TIMER);
  const [skipLimit, setSL]      = useState(DEFAULT_DUEL_SKIPS);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinErr] = useState("");
  const [isCreating, setCreating] = useState(false);
  const [isJoining, setJoining]   = useState(false);

  const createDuel = useDuelStore((s) => s.createDuel);
  const joinDuel   = useDuelStore((s) => s.joinDuel);
  const { claimTeam, deviceId } = useDevice();
  const navigate   = useNavigate();

  const handleCreate = async () => {
    setCreating(true);
    const code = await createDuel({ boardLength, timerSeconds, skipLimit, hostDeviceId: deviceId });
    claimTeam(0, true);
    navigate(`/duel/${code}`);
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 4) {
      setJoinErr("Room codes are exactly 4 characters (e.g. X7KP)");
      return;
    }
    setJoinErr("");
    if (isOnlineMode) {
      setJoining(true);
      const found = await duelExists(code);
      setJoining(false);
      if (!found) {
        setJoinErr("Duel room not found. Check the code and try again.");
        return;
      }
    }
    joinDuel(code);
    navigate(`/duel/${code}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sky-400 hover:text-sky-600 text-sm mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="bg-white rounded-3xl border border-sky-100 shadow-md p-7"
        >
          {/* Mode badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-xs font-bold mb-5">
            <Swords size={12} /> Duel Mode · 1 vs 1
          </div>

          <h1 className="font-display text-3xl text-sky-950 mb-5">
            {tab === "create" ? "New Duel" : "Join Duel"}
          </h1>

          {/* Tab switcher */}
          <div className="flex gap-2 rounded-2xl bg-sky-50 p-1.5 mb-6">
            {[
              { id: "create", label: "Create", icon: Swords },
              { id: "join",   label: "Join",   icon: KeyRound },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                  tab === t.id ? "bg-violet-600 text-white shadow-sm" : "text-sky-400 hover:text-sky-600"
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
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-2 block">Board Length</label>
                  <TogglePill options={BOARD_PRESETS} value={boardLength} onChange={setBL} />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5 mb-2">
                    <Clock size={12} /> Turn Timer
                  </label>
                  <TogglePill options={TIMER_PRESETS} value={timerSeconds} onChange={setTS} />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-sky-400 flex items-center gap-1.5 mb-2">
                    <SkipForward size={12} /> Skips per Turn
                  </label>
                  <TogglePill options={SKIP_PRESETS} value={skipLimit} onChange={setSL} />
                  <p className="text-xs text-sky-300 mt-1.5">
                    Speaker can skip words they can't describe (per turn limit)
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-violet-50 p-4 text-center text-sm text-sky-500">
                  <div><p className="font-display text-2xl text-sky-900">{boardLength}</p><p>Spaces</p></div>
                  <div><p className="font-display text-2xl text-sky-900">{timerSeconds}s</p><p>Timer</p></div>
                  <div><p className="font-display text-2xl text-sky-900">{skipLimit === 99 ? "∞" : skipLimit}</p><p>Skips</p></div>
                </div>

                <Button size="lg" variant="primary" className="w-full !bg-violet-600 hover:!bg-violet-700 !border-violet-500 !shadow-violet-200"
                  onClick={handleCreate} disabled={isCreating}
                  icon={isCreating ? Loader2 : ChevronRight}
                >
                  {isCreating ? "Creating…" : "Create Duel"}
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
                    <p className="text-amber-600/80">Both players share this device. Enter any 4-char code.</p>
                  </div>
                )}

                <Input
                  label="Duel Code"
                  placeholder="e.g. X7KP"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                  error={joinError}
                  icon={Hash}
                  className="text-center text-2xl font-display tracking-[0.3em]"
                  maxLength={4}
                />

                <Button size="lg" variant="primary" className="w-full !bg-violet-600 hover:!bg-violet-700 !border-violet-500 !shadow-violet-200"
                  onClick={handleJoin} disabled={isJoining}
                  icon={isJoining ? Loader2 : KeyRound}
                >
                  {isJoining ? "Checking code…" : "Join Duel"}
                </Button>

                <p className="text-center text-sky-400 text-sm">
                  No code?{" "}
                  <button onClick={() => setTab("create")} className="text-violet-600 font-bold hover:underline cursor-pointer">
                    Create a new duel
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
