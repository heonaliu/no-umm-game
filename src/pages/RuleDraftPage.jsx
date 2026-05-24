/**
 * RuleDraftPage — secret per-team card selection.
 * In online mode each team drafts on their own device (only their cards visible).
 * In local mode teams take turns revealing/selecting privately.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ChevronRight, Check, Layers } from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { useDevice } from "../context/DeviceContext";
import { RuleCard } from "../components/game/RuleCard";
import { Button } from "../components/ui/Button";
import { isOnlineMode } from "../lib/firebase";

export function RuleDraftPage() {
  const teams           = useGameStore((s) => s.teams);
  const toggleDraftCard = useGameStore((s) => s.toggleDraftCard);
  const finalizeDraft   = useGameStore((s) => s.finalizeDraft);
  const { myTeamIndex, isHost } = useDevice();

  // Local mode: cycle through each team; online mode: only show your own team
  const [localIdx, setLocalIdx] = useState(0);
  const [revealed, setRevealed] = useState(isOnlineMode); // auto-reveal in online mode

  const draftTeamIdx = isOnlineMode ? (myTeamIndex ?? 0) : localIdx;
  const draftTeam    = teams[draftTeamIdx];
  const nextTeam     = teams[(draftTeamIdx + 1) % teams.length];

  const mySelection = draftTeam?.selectedDraftCards ?? [];
  const done        = mySelection.length === 3;
  const allDone     = teams.every((t) => (t.selectedDraftCards?.length ?? 0) === 3);

  // In online mode re-reveal whenever team changes
  useEffect(() => { if (isOnlineMode) setRevealed(true); }, [draftTeamIdx]);

  const handleLocalNext = () => {
    setRevealed(false);
    setLocalIdx((i) => i + 1);
  };

  return (
    <div className="min-h-screen p-4 pb-28">
      <div className="max-w-2xl mx-auto pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="text-center mb-7"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-100 mb-4">
            <Layers size={26} className="text-sky-600" />
          </div>
          <h1 className="font-display text-4xl text-sky-950">Rule Draft</h1>
          <p className="text-sky-400 text-sm mt-1">
            Each team secretly picks <strong className="text-sky-700">3 rule cards</strong> to give to another team
          </p>

          {/* Progress pills */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {teams.map((t, i) => {
              const teamDone = (t.selectedDraftCards?.length ?? 0) === 3;
              return (
                <div
                  key={t.id}
                  className={`h-2 rounded-full transition-all ${
                    (!isOnlineMode && i === localIdx) || (isOnlineMode && i === myTeamIndex)
                      ? "w-8"
                      : "w-2"
                  }`}
                  style={{
                    backgroundColor: teamDone
                      ? t.color?.hex
                      : (!isOnlineMode && i === localIdx) || (isOnlineMode && i === myTeamIndex)
                        ? t.color?.hex
                        : "#e0f2fe",
                  }}
                />
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={draftTeamIdx}
            initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }}
            className="rounded-3xl bg-white border-2 p-6 shadow-sm mb-4"
            style={{ borderColor: draftTeam?.color?.hex + "60" }}
          >
            {/* Team header */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl">{draftTeam?.pawn}</span>
              <div>
                <h2 className="font-display text-2xl" style={{ color: draftTeam?.color?.hex }}>
                  {draftTeam?.name}
                </h2>
                <p className="text-sky-400 text-xs">
                  {revealed
                    ? `Choose 3 cards to give to ${nextTeam?.name}`
                    : isOnlineMode
                      ? "Your secret cards — others look away first!"
                      : "Others, look away! Then tap Reveal."}
                </p>
              </div>
            </div>

            {!revealed ? (
              <Button variant="primary" size="lg" className="w-full" onClick={() => setRevealed(true)} icon={Eye}>
                Reveal My Cards
              </Button>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Counter */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-sky-500">
                    Selected: <strong className="text-sky-900">{mySelection.length}</strong> / 3
                    {done && <span className="text-emerald-600 ml-2">✓ Done!</span>}
                  </p>
                  <p className="text-xs text-sky-300">→ passes to {nextTeam?.name} {nextTeam?.pawn}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {(draftTeam?.ruleCards ?? []).map((rule, i) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      selected={mySelection.includes(rule.id)}
                      onToggle={(id) => toggleDraftCard(draftTeam.id, id)}
                      animateIn
                      delay={i * 0.05}
                    />
                  ))}
                </div>

                {/* In local mode: advance to next team */}
                {!isOnlineMode && (
                  <Button
                    variant="primary" size="lg" className="w-full"
                    disabled={!done}
                    onClick={handleLocalNext}
                    icon={done ? Check : undefined}
                  >
                    {done ? "Confirm — Next Team" : `Select ${3 - mySelection.length} more`}
                  </Button>
                )}

                {/* In online mode: confirmed state */}
                {isOnlineMode && done && (
                  <div className="flex items-center gap-2 text-emerald-600 justify-center font-bold text-sm">
                    <Check size={18} /> Cards selected! Waiting for other teams…
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Team status list */}
        <div className="space-y-2 mb-8">
          {teams.map((t, i) => {
            const teamDone = (t.selectedDraftCards?.length ?? 0) === 3;
            const isMine   = isOnlineMode ? i === myTeamIndex : i === localIdx;
            return (
              <div
                key={t.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-all ${
                  isMine    ? "border-sky-300 bg-sky-50"
                  : teamDone ? "border-emerald-200 bg-emerald-50"
                  :            "border-sky-100 bg-white"
                }`}
              >
                <span className="text-xl">{t.pawn}</span>
                <span className="flex-1 font-display" style={{ color: t.color?.hex }}>{t.name}</span>
                {teamDone
                  ? <span className="text-emerald-600 text-sm font-bold flex items-center gap-1"><Check size={14} /> Ready</span>
                  : isMine
                    ? <span className="text-sky-400 text-sm">Drafting…</span>
                    : <span className="text-sky-200 text-sm">Waiting</span>
                }
              </div>
            );
          })}
        </div>

        {/* Finalize — visible to host or all in local mode */}
        {(isHost || !isOnlineMode) && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-sky-50 via-sky-50/90 to-transparent">
            <div className="max-w-2xl mx-auto">
              <Button
                size="lg" variant="primary" className="w-full"
                disabled={!allDone}
                onClick={finalizeDraft}
                icon={ChevronRight}
              >
                {allDone ? "Start Game!" : "Waiting for all teams to finish…"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
