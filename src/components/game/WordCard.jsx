/**
 * WordCard — displays the current word pair for the active describer.
 * Has a flip animation when a new pair is drawn.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../../store/gameStore";

export function WordCard() {
  const wordPair = useGameStore((s) => s.currentWordPair);

  if (!wordPair) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={wordPair.key}
        initial={{ rotateY: -90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: 90, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
        className="rounded-3xl border-2 border-violet-400/60 bg-gradient-to-br from-violet-900/80 to-indigo-900/80 p-6 text-center shadow-2xl shadow-violet-900/50 min-w-[280px]"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400 mb-3">
          📝 Describe Both Words
        </p>

        {/* Word A */}
        <div className="mb-2">
          <span className="text-xs text-white/40 uppercase tracking-widest">Word A</span>
          <motion.h2
            className="font-display text-4xl text-white text-shadow"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {wordPair.wordA}
          </motion.h2>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 my-2">
          <div className="flex-1 h-px bg-white/20" />
          <span className="text-violet-400 text-lg">✦</span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        {/* Word B */}
        <div className="mt-2">
          <span className="text-xs text-white/40 uppercase tracking-widest">Word B</span>
          <motion.h2
            className="font-display text-4xl text-white text-shadow"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {wordPair.wordB}
          </motion.h2>
        </div>

        <p className="mt-4 text-xs text-white/30">
          Get your team to say these in order — {wordPair.wordA} first!
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
