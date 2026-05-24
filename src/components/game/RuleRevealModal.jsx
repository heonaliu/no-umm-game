/** RuleRevealModal — pops up when a team lands on a yellow space. */

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";

export function RuleRevealModal({ rule, teamName, teamColor, isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && rule && (
        <>
          <motion.div
            key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-sky-950/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.6, y: 80 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.75, y: -40 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm rounded-3xl bg-white border-2 border-amber-300 shadow-2xl shadow-amber-100 p-7 text-center">
              <button onClick={onClose} className="absolute top-4 right-4 text-sky-300 hover:text-sky-500">
                <X size={18} />
              </button>

              <motion.div
                animate={{ rotate: [0, -10, 10, -6, 6, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4"
              >
                <Star size={32} className="text-amber-500 fill-amber-400" />
              </motion.div>

              <p className="text-amber-600 text-xs font-bold uppercase tracking-widest mb-1">
                New Rule Activated!
              </p>
              <p className="text-sky-400 text-sm mb-5">
                <span className="font-bold" style={{ color: teamColor }}>{teamName}</span> landed on a Rule Space
              </p>

              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 mb-4">
                <h3 className="font-display text-xl text-sky-900 mb-1">{rule.title}</h3>
                <p className="text-sky-600/70 text-sm">{rule.description}</p>
              </div>

              <p className="text-sky-300 text-xs">
                This rule stays active for the rest of the game!
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
