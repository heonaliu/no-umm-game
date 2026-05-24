/**
 * TeamSetupPage — each team customizes their name, color, and pawn.
 * Shows room code prominently so others can "join".
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore, GAME_PHASES } from "../store/gameStore";
import { TEAM_COLORS, TEAM_PAWNS } from "../data/teams";
import { Button } from "../components/ui/Button";

function TeamEditor({ team, index }) {
  const updateTeam = useGameStore((s) => s.updateTeam);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(team.name);

  const saveName = () => {
    if (nameInput.trim()) {
      updateTeam(team.id, { name: nameInput.trim() });
    }
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-3xl border border-white/15 bg-white/5 p-5 space-y-4"
      style={{ borderColor: `${team.color?.hex}40` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-4xl">{team.pawn}</span>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                maxLength={20}
                className="flex-1 bg-white/10 border-2 border-violet-400/60 rounded-xl px-3 py-1.5 text-white font-display text-xl focus:outline-none"
              />
              <button onClick={saveName} className="text-violet-400 text-sm font-bold px-2">
                ✓
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 group"
            >
              <h2
                className="font-display text-2xl text-white truncate"
                style={{ color: team.color?.hex }}
              >
                {team.name}
              </h2>
              <span className="text-white/20 group-hover:text-white/60 text-sm transition-colors">
                ✎
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Color</p>
        <div className="flex gap-2 flex-wrap">
          {TEAM_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => updateTeam(team.id, { color })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                team.color?.id === color.id
                  ? "border-white scale-110 ring-2 ring-white/50"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Pawn picker */}
      <div>
        <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Pawn</p>
        <div className="flex gap-2 flex-wrap">
          {TEAM_PAWNS.map((pawn) => (
            <button
              key={pawn}
              onClick={() => updateTeam(team.id, { pawn })}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all border-2 ${
                team.pawn === pawn
                  ? "border-violet-400 bg-violet-500/20 scale-110"
                  : "border-transparent bg-white/5 hover:bg-white/10"
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
  const teams = useGameStore((s) => s.teams);
  const roomCode = useGameStore((s) => s.roomCode);
  const dealRuleCards = useGameStore((s) => s.dealRuleCards);
  const setPhase = useGameStore((s) => s.setPhase);

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 pt-6"
        >
          {/* Room code badge */}
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 mb-4">
            <span className="text-white/40 text-sm">Room Code</span>
            <span className="font-display text-2xl text-white tracking-[0.2em]">{roomCode}</span>
            <button
              onClick={() => navigator.clipboard?.writeText(roomCode)}
              className="text-white/30 hover:text-white/70 text-xs transition-colors ml-1"
              title="Copy code"
            >
              📋
            </button>
          </div>

          <h1 className="font-display text-4xl text-white text-shadow">
            Team Setup
          </h1>
          <p className="text-white/50 mt-2">Customize each team before playing</p>
        </motion.div>

        {/* Team editors */}
        <div className="space-y-4 mb-8">
          {teams.map((team, i) => (
            <TeamEditor key={team.id} team={team} index={i} />
          ))}
        </div>

        {/* Next step */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0f0a1e] to-transparent"
        >
          <div className="max-w-2xl mx-auto">
            <Button size="lg" variant="primary" className="w-full" onClick={dealRuleCards}>
              🃏 Next: Rule Drafting →
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
