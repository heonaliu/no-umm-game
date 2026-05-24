/**
 * RuleRevealModal — pops up to celebrate when a team lands on a yellow space
 * and a new rule card is activated. Shown briefly, then auto-dismisses.
 *
 * Usage: parent detects when a team's activeRules length increases and
 * passes the newly activated rule here.
 */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function RuleRevealModal({ rule, teamName, teamColor, isOpen, onClose }) {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(onClose, 4000);
      return () => clearTimeout(t);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && rule && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.6, y: 80 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: -40 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm rounded-3xl border-2 border-yellow-400/60 bg-[#1a1506] shadow-2xl shadow-yellow-900/40 p-7 text-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8 }}
                className="text-7xl mb-4"
              >
                ⭐
              </motion.div>

              <p className="text-yellow-400/70 text-xs uppercase tracking-widest font-bold mb-1">
                New Rule Activated!
              </p>
              <p className="text-white/40 text-sm mb-4">
                <span style={{ color: teamColor }} className="font-bold">{teamName}</span> landed on a Rule Space
              </p>

              <div className="rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-4 mb-5">
                <div className="text-4xl mb-2">{rule.emoji}</div>
                <h2 className="font-display text-2xl text-yellow-300 mb-1">{rule.title}</h2>
                <p className="text-white/60 text-sm">{rule.description}</p>
                <span className="mt-2 inline-block text-xs font-bold uppercase tracking-widest text-yellow-500">
                  {rule.difficulty}
                </span>
              </div>

              <p className="text-white/30 text-xs">
                This rule is now in effect for the rest of the game!
              </p>

              <button
                onClick={onClose}
                className="mt-4 text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Got it →
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
