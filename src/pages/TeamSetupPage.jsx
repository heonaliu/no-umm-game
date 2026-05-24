/**
 * TeamSetupPage — team names, colors, pawns.
 *
 * In ONLINE mode: after joining, each device also picks WHICH team they
 * represent via the "My Team" selector at the top.
 * teamClaims (synced via Firebase) prevents two devices claiming the same slot.
 *
 * In LOCAL mode: no team claiming needed (everyone shares one device).
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Copy, Check, ArrowLeft, ChevronRight, Lock, Users } from "lucide-react";
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
                className="flex-1 bg-sky-50 border-2 border-sky-300 rounded-xl px-3 py-1.5 text-sky-900 font-display text-xl focus:outline-none"
              />
              <button onClick={save} className="text-sky-600 font-bold text-sm px-2">
                <Check size={18} />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-2 group text-left">
              <span className="font-display text-2xl" style={{ color: team.color?.hex }}>
                {team.name}
              </span>
              <Pencil size={14} className="text-sky-200 group-hover:text-sky-400 transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs uppercase tracking-widest text-sky-300 mb-2">Colour</p>
        <div className="flex gap-2 flex-wrap">
          {TEAM_COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => updateTeam(team.id, { color: c })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                team.color?.id === c.id
                  ? "border-sky-600 scale-115 ring-2 ring-sky-300"
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
        <p className="text-xs uppercase tracking-widest text-sky-300 mb-2">Pawn</p>
        <div className="flex gap-2 flex-wrap">
          {TEAM_PAWNS.map((pawn) => (
            <button
              key={pawn}
              onClick={() => updateTeam(team.id, { pawn })}
              className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all border-2 ${
                team.pawn === pawn
                  ? "border-sky-400 bg-sky-50 scale-110"
                  : "border-transparent bg-sky-50/40 hover:bg-sky-50"
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
  const teams           = useGameStore((s) => s.teams);
  const numTeams        = useGameStore((s) => s.numTeams);
  const roomCode        = useGameStore((s) => s.roomCode);
  const teamClaims      = useGameStore((s) => s.teamClaims ?? {});
  const setPhase        = useGameStore((s) => s.setPhase);
  const dealRuleCards   = useGameStore((s) => s.dealRuleCards);
  const claimTeamSlot   = useGameStore((s) => s.claimTeamSlot);
  const releaseTeamSlot = useGameStore((s) => s.releaseTeamSlot);

  const { deviceId, myTeamIndex, isHost, claimTeam } = useDevice();
  const [copied, setCopied] = useState(false);

  // How many slots are claimed (in online mode every slot must have a device)
  const claimedCount   = Object.keys(teamClaims).length;
  const allSlotsFilled = !isOnlineMode || claimedCount >= numTeams;

  // Re-establish this device's claim in Firebase whenever we land here.
  // Handles page refresh and "Play Again" (which resets teamClaims to {}).
  useEffect(() => {
    if (!isOnlineMode || !deviceId || myTeamIndex === null) return;
    claimTeamSlot(myTeamIndex, deviceId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);

  const copyCode = () => {
    navigator.clipboard?.writeText(roomCode ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleToggleClaim = (idx) => {
    if (myTeamIndex === idx) {
      // Tap own slot → deselect
      claimTeam(null, isHost);
      releaseTeamSlot(deviceId);
    } else {
      // Tap available slot → claim (releases old slot automatically in claimTeamSlot)
      claimTeam(idx, isHost);
      claimTeamSlot(idx, deviceId);
    }
  };

  // Must claim a team before proceeding (online joiners only)
  const needsTeamClaim = isOnlineMode && myTeamIndex === null && !isHost;

  return (
    <div className="min-h-screen p-4 pb-28">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setPhase(GAME_PHASES.LOBBY)}
          className="flex items-center gap-1.5 text-sky-400 hover:text-sky-600 text-sm mt-6 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          {/* Room code */}
          <div className="inline-flex items-center gap-3 rounded-2xl bg-white border border-sky-200 px-5 py-2.5 mb-4 shadow-sm">
            <span className="text-sky-400 text-xs font-bold uppercase tracking-widest">Room Code</span>
            <span className="font-display text-2xl text-sky-900 tracking-[0.2em]">{roomCode}</span>
            <button onClick={copyCode} className="text-sky-300 hover:text-sky-500 transition-colors">
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
          </div>

          <h1 className="font-display text-4xl text-sky-950">Team Setup</h1>
          <p className="text-sky-400 mt-1">Customise each team before playing</p>

          {isOnlineMode && (
            <p className="text-xs text-sky-300 mt-2">
              Share the room code — each team opens this app and joins with the code
            </p>
          )}
        </motion.div>

        {/* Team claim panel (online join flow) */}
        {isOnlineMode && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mb-6 rounded-2xl bg-sky-50 border border-sky-200 p-4"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-sky-400 mb-3">
              I am representing…
            </p>
            <div className="flex gap-2 flex-wrap">
              {teams.map((team, i) => {
                const claimedBy = teamClaims[String(i)];
                const isMine    = myTeamIndex === i;
                const isTaken   = claimedBy && claimedBy !== deviceId;

                return (
                  <button
                    key={team.id}
                    onClick={() => !isTaken && handleToggleClaim(i)}
                    disabled={isTaken}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-bold text-sm
                      transition-all select-none
                      ${isMine
                        ? "bg-sky-100 text-sky-800"
                        : isTaken
                          ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                          : "border-sky-100 bg-white text-sky-500 hover:border-sky-300 cursor-pointer"
                      }
                    `}
                    style={isMine ? { borderColor: team.color?.hex } : {}}
                  >
                    <span>{team.pawn}</span>
                    <span style={{ color: isMine ? team.color?.hex : undefined }}>
                      {team.name}
                    </span>
                    {isMine   && <Check size={14} className="text-sky-600 shrink-0" />}
                    {isTaken  && <Lock  size={12} className="text-gray-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {needsTeamClaim && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                ↑ Select your team to continue
              </p>
            )}

            {/* Live claim status */}
            <AnimatePresence>
              {Object.keys(teamClaims).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-sky-200 flex flex-wrap gap-2"
                >
                  {teams.map((team, i) => {
                    const claimedBy = teamClaims[String(i)];
                    if (!claimedBy) return null;
                    const isMe = claimedBy === deviceId;
                    return (
                      <span
                        key={team.id}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                          isMe
                            ? "bg-sky-100 text-sky-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {team.pawn} {team.name}
                        <span className="font-normal opacity-70">{isMe ? "— you" : "— joined"}</span>
                      </span>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
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
                style={{ borderColor: myTeamIndex === i ? team.color?.hex + "80" : "#e0f2fe" }}
              >
                <span className="text-3xl">{team.pawn}</span>
                <span className="font-display text-xl" style={{ color: team.color?.hex }}>
                  {team.name}
                </span>
                {myTeamIndex === i && (
                  <span className="ml-auto text-xs font-bold text-sky-500 bg-sky-100 px-2 py-0.5 rounded-full">
                    You
                  </span>
                )}
              </div>
            ))}
            <p className="text-xs text-center text-sky-300">
              Waiting for the host to customise teams…
            </p>
          </div>
        )}

        {/* Bottom CTA — only host proceeds, gated on every slot being claimed */}
        {isHost && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-sky-50 via-sky-50/90 to-transparent">
            <div className="max-w-2xl mx-auto space-y-2">
              <AnimatePresence>
                {isOnlineMode && !allSlotsFilled && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="flex items-center justify-center gap-2 text-sky-500 text-sm font-medium"
                  >
                    <Users size={15} />
                    Waiting for all teams to join —{" "}
                    <span className="font-bold text-sky-700">{claimedCount} / {numTeams}</span> ready
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                size="lg" variant="primary" className="w-full"
                disabled={!allSlotsFilled}
                onClick={dealRuleCards}
                icon={ChevronRight}
              >
                {allSlotsFilled ? "Next: Rule Drafting" : `Waiting for teams… (${claimedCount}/${numTeams})`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
