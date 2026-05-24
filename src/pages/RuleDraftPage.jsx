/**
 * RuleDraftPage — Each team secretly selects 3 rule cards to give another team.
 *
 * Flow:
 *   1. One team at a time sees their 6 cards and picks 3 (others look away)
 *   2. When all teams have picked, "Finalize Draft" is enabled
 *   3. Rules are assigned to the next team (team N passes to team N+1)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import { RuleCard } from "../components/game/RuleCard";
import { Button } from "../components/ui/Button";

export function RuleDraftPage() {
  const teams = useGameStore((s) => s.teams);
  const toggleDraftCard = useGameStore((s) => s.toggleDraftCard);
  const finalizeDraft = useGameStore((s) => s.finalizeDraft);
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const activeTeam = teams[activeTeamIdx];
  const allTeamsDone = teams.every((t) => (t.selectedDraftCards?.length ?? 0) === 3);
  const nextTeam = teams[(activeTeamIdx + 1) % teams.length];

  const handleReveal = () => setRevealed(true);
  const handleDoneTeam = () => {
    setRevealed(false);
    if (activeTeamIdx < teams.length - 1) {
      setActiveTeamIdx((i) => i + 1);
    }
  };

  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center pt-6 mb-6"
        >
          <h1 className="font-display text-4xl text-white text-shadow mb-2">
            🃏 Rule Draft
          </h1>
          <p className="text-white/50 text-sm">
            Each team secretly picks <strong className="text-white">3 rule cards</strong> to give to another team.
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {teams.map((t, i) => (
              <div
                key={t.id}
                className={`rounded-full transition-all ${
                  i === activeTeamIdx
                    ? "w-6 h-3"
                    : (t.selectedDraftCards?.length ?? 0) === 3
                      ? "w-3 h-3 bg-emerald-400"
                      : "w-3 h-3 bg-white/20"
                }`}
                style={i === activeTeamIdx ? { backgroundColor: t.color?.hex, height: 12, width: 24, borderRadius: 99 } : {}}
              />
            ))}
          </div>
        </motion.div>

        {/* Active team panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTeamIdx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="rounded-3xl border border-white/15 bg-white/5 p-6 mb-6"
            style={{ borderColor: `${activeTeam.color?.hex}40` }}
          >
            {/* Team header */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl">{activeTeam.pawn}</span>
              <div>
                <h2 className="font-display text-2xl" style={{ color: activeTeam.color?.hex }}>
                  {activeTeam.name}
                </h2>
                <p className="text-white/40 text-sm">
                  {revealed
                    ? `Select exactly 3 cards to give to ${nextTeam.name}`
                    : "Others, look away! Then press Reveal."}
                </p>
              </div>
            </div>

            {!revealed ? (
              /* Reveal button */
              <Button variant="primary" size="lg" className="w-full" onClick={handleReveal}>
                👀 Reveal My Cards
              </Button>
            ) : (
              /* Card selection */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Selection counter */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white/60 text-sm">
                    Cards selected:{" "}
                    <span className="font-bold text-white">
                      {activeTeam.selectedDraftCards?.length ?? 0} / 3
                    </span>
                  </p>
                  <p className="text-xs text-white/30">
                    → passes to {nextTeam.name} {nextTeam.pawn}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {(activeTeam.ruleCards ?? []).map((rule, i) => (
                    <RuleCard
                      key={rule.id}
                      rule={rule}
                      selected={(activeTeam.selectedDraftCards ?? []).includes(rule.id)}
                      onToggle={(id) => toggleDraftCard(activeTeam.id, id)}
                      animateIn
                      delay={i * 0.06}
                    />
                  ))}
                </div>

                <Button
                  variant="success"
                  size="lg"
                  className="w-full"
                  disabled={(activeTeam.selectedDraftCards?.length ?? 0) !== 3}
                  onClick={handleDoneTeam}
                >
                  ✅ Confirm Selection
                  {(activeTeam.selectedDraftCards?.length ?? 0) !== 3 && (
                    <span className="ml-2 text-sm font-body opacity-70">
                      (select {3 - (activeTeam.selectedDraftCards?.length ?? 0)} more)
                    </span>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Teams status list */}
        <div className="space-y-2 mb-8">
          {teams.map((t, i) => {
            const done = (t.selectedDraftCards?.length ?? 0) === 3;
            return (
              <div
                key={t.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-all ${
                  i === activeTeamIdx
                    ? "border-violet-400/40 bg-violet-500/10"
                    : done
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-white/10 bg-white/5"
                }`}
              >
                <span className="text-2xl">{t.pawn}</span>
                <span className="flex-1 font-display" style={{ color: t.color?.hex }}>
                  {t.name}
                </span>
                {done ? (
                  <span className="text-emerald-400 text-sm font-bold">✓ Ready</span>
                ) : i === activeTeamIdx ? (
                  <span className="text-violet-400 text-sm font-bold">▶ Drafting…</span>
                ) : (
                  <span className="text-white/30 text-sm">Waiting</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Finalize CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: allTeamsDone ? 1 : 0.5 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0f0a1e] to-transparent"
        >
          <div className="max-w-2xl mx-auto">
            <Button
              size="lg"
              variant="primary"
              className="w-full"
              disabled={!allTeamsDone}
              onClick={finalizeDraft}
            >
              {allTeamsDone ? "🎮 Start Game!" : `Waiting for all teams to draft…`}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
