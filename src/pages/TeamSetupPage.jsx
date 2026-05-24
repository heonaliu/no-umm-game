/**
 * TeamSetupPage — team names, colors, pawns.
 *
 * In ONLINE mode: after joining, each device also picks WHICH team they
 * represent via the "My Team" selector at the top.
 *
 * In LOCAL mode: no team claiming needed (everyone shares one device).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Copy, Check, ArrowLeft, ChevronRight } from "lucide-react";
import { useGameStore, GAME_PHASES } from "../store/gameStore";
import { useDevice } from "../context/DeviceContext";
import { TEAM_COLORS, TEAM_PAWNS } from "../data/teams";
import { Button } from "../components/ui/Button";
import { isOnlineMode } from "../lib/firebase";

function TeamEditor({ team, index }) {
  const updateTeam = useGameStore((s) => s.updateTeam);
  const [editing, setEditing] = useState(false);
  const [name, setName]       = useState(team.name);

  const save = () => {
    if (name.trim()) updateTeam(team.id, { name: name.trim() });
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-3xl bg-white border-2 p-5 space-y-4 shadow-sm"
      style={{ borderColor: team.color?.hex + "50" }}
    >
      {/* Name row */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">{team.pawn}</span>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2">
              <input
                autoFocus value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={save}
                onKeyDown={(e) => e.key === "Enter" && save()}
                maxLength={20}
                className="flex-1 bg-indigo-50 border-2 border-indigo-300 rounded-xl px-3 py-1.5 text-indigo-900 font-display text-xl focus:outline-none"
              />
              <button onClick={save} className="text-indigo-600 font-bold text-sm px-2">
                <Check size={18} />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 group text-left">
              <span className="font-display text-2xl" style={{ color: team.color?.hex }}>
                {team.name}
              </span>
              <Pencil size={14} className="text-indigo-200 group-hover:text-indigo-400 transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs uppercase tracking-widest text-indigo-300 mb-2">Colour</p>
        <div className="flex gap-2 flex-wrap">
          {TEAM_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => updateTeam(team.id, { color: c })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                team.color?.id === c.id
                  ? "border-indigo-600 scale-115 ring-2 ring-indigo-300"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Pawn */}
      <div>
        <p className="text-xs uppercase tracking-widest text-indigo-300 mb-2">Pawn</p>
        <div className="flex gap-2 flex-wrap">
          {TEAM_PAWNS.map((pawn) => (
            <button
              key={pawn}
              onClick={() => updateTeam(team.id, { pawn })}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all border-2 ${
                team.pawn === pawn
                  ? "border-indigo-400 bg-indigo-50 scale-110"
                  : "border-transparent bg-indigo-50/40 hover:bg-indigo-50"
              }`}
            >
              {pawn}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function TeamSetupPage() {
  const teams       = useGameStore((s) => s.teams);
  const roomCode    = useGameStore((s) => s.roomCode);
  const setPhase    = useGameStore((s) => s.setPhase);
  const dealRuleCards = useGameStore((s) => s.dealRuleCards);
  const { myTeamIndex, isHost, claimTeam } = useDevice();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleClaim = (idx) => claimTeam(idx, isHost);

  // If joining, must claim a team first (online mode only)
  const needsTeamClaim = isOnlineMode && myTeamIndex === null && !isHost;

  return (
    <div className="min-h-screen p-4 pb-28">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setPhase(GAME_PHASES.LOBBY)}
          className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-600 text-sm mt-6 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          {/* Room code */}
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white border border-indigo-200 px-5 py-2.5 mb-4 shadow-sm">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-widest">Room Code</span>
            <span className="font-display text-2xl text-indigo-900 tracking-[0.2em]">{roomCode}</span>
            <button onClick={copyCode} className="text-indigo-300 hover:text-indigo-500 transition-colors">
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>

          <h1 className="font-display text-4xl text-indigo-950">Team Setup</h1>
          <p className="text-indigo-400 mt-1">Customise each team before playing</p>

          {isOnlineMode && (
            <p className="text-xs text-indigo-300 mt-2">
              Share the room code — each team opens this app and joins with the code
            </p>
          )}
        </motion.div>

        {/* Team claim panel (online join flow) */}
        {isOnlineMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 rounded-2xl bg-indigo-50 border border-indigo-200 p-4"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">
              I am representing…
            </p>
            <div className="flex gap-2 flex-wrap">
              {teams.map((team, i) => (
                <button
                  key={team.id}
                  onClick={() => handleClaim(i)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-bold text-sm transition-all ${
                    myTeamIndex === i
                      ? "border-indigo-500 bg-indigo-100 text-indigo-800"
                      : "border-indigo-100 bg-white text-indigo-500 hover:border-indigo-300"
                  }`}
                  style={myTeamIndex === i ? { borderColor: team.color?.hex } : {}}
                >
                  <span>{team.pawn}</span>
                  <span style={{ color: myTeamIndex === i ? team.color?.hex : undefined }}>
                    {team.name}
                  </span>
                  {myTeamIndex === i && <Check size={14} className="text-indigo-600" />}
                </button>
              ))}
            </div>
            {needsTeamClaim && (
              <p className="text-xs text-amber-600 mt-2">Please select which team you are to continue</p>
            )}
          </motion.div>
        )}

        {/* Team editors — only host can edit all teams */}
        {isHost ? (
          <div className="space-y-4 mb-8">
            {teams.map((team, i) => (
              <TeamEditor key={team.id} team={team} index={i} />
            ))}
          </div>
        ) : (
          /* Non-host just sees team list */
          <div className="space-y-3 mb-8">
            {teams.map((team, i) => (
              <div
                key={team.id}
                className={`flex items-center gap-3 rounded-2xl p-4 border-2 bg-white ${
                  myTeamIndex === i ? "shadow-sm" : "opacity-70"
                }`}
                style={{ borderColor: myTeamIndex === i ? team.color?.hex + "80" : "#e0e7ff" }}
              >
                <span className="text-3xl">{team.pawn}</span>
                <span className="font-display text-xl" style={{ color: team.color?.hex }}>
                  {team.name}
                </span>
                {myTeamIndex === i && (
                  <span className="ml-auto text-xs font-bold text-indigo-500 bg-indigo-100 px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
            ))}
            <p className="text-xs text-center text-indigo-300">
              Waiting for the host to customise teams…
            </p>
          </div>
        )}

        {/* Bottom CTA — only host proceeds */}
        {isHost && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-indigo-50 via-indigo-50/90 to-transparent">
            <div className="max-w-2xl mx-auto">
              <Button size="lg" variant="primary" className="w-full" onClick={dealRuleCards} icon={ChevronRight}>
                Next: Rule Drafting
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
