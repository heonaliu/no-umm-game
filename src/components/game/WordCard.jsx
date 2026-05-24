/**
 * WordCard — flips to reveal each new word pair for the active describer.
 * Only rendered on the active team's device.
 */

import { motion, AnimatePresence } from "framer-motion";
import { FileText } from "lucide-react";
import { useGameStore } from "../../store/gameStore";

export function WordCard() {
  const wordPair = useGameStore((s) => s.currentWordPair);
  if (!wordPair) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={wordPair.key}
        initial={{ rotateX: -80, opacity: 0 }}
        animate={{ rotateX: 0,   opacity: 1 }}
        exit={{   rotateX:  80,  opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ transformStyle: "preserve-3d" }}
        className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 text-center shadow-md shadow-indigo-100"
      >
        <div className="flex items-center justify-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
          <FileText size={13} />
          Describe both words — in order
        </div>

        {/* Word A */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 mb-0.5">Word A</p>
          <motion.p
            className="font-display text-3xl text-indigo-900"
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.08 }}
          >
            {wordPair.wordA}
          </motion.p>
        </div>

        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-indigo-200" />
          <span className="text-violet-400 font-bold">then</span>
          <div className="flex-1 h-px bg-indigo-200" />
        </div>

        {/* Word B */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 mb-0.5">Word B</p>
          <motion.p
            className="font-display text-3xl text-indigo-900"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 }}
          >
            {wordPair.wordB}
          </motion.p>
        </div>

        <p className="mt-4 text-[11px] text-indigo-300">
          No "um", "uh", or filler sounds — other teams are listening!
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
