/**
 * LandingPage — home screen with mode selection.
 *
 * Mode A: Team Mode  → /team  (2–6 teams, full rule-draft experience)
 * Mode B: Duel Mode  → /duel  (1v1 head-to-head, fast-paced)
 */

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Bell, Users, Swords, Star, Flame, ChevronRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { isOnlineMode } from "../lib/firebase";

const HOW_TO = [
  { icon: Users,  color: "bg-sky-100 text-sky-600",       label: "Form teams",       desc: "2–6 teams, each on their own device" },
  { icon: Bell,   color: "bg-red-100 text-red-600",       label: "Listen for um/uh", desc: "Other teams tap DING to catch violations" },
  { icon: Star,   color: "bg-amber-100 text-amber-600",   label: "Land on rules",    desc: "Yellow spaces reveal special rules" },
  { icon: Flame,  color: "bg-orange-100 text-orange-600", label: "Danger Zone",      desc: "Last 5 spaces — everyone must be perfect" },
];

function FloatBlob({ size, color, style }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, background: color, filter: "blur(70px)", opacity: 0.35, ...style }}
      animate={{ y: [0, -18, 0], scale: [1, 1.06, 1] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: style.delay ?? 0 }}
    />
  );
}

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Decorative blobs */}
      <FloatBlob size={500} color="#0ea5e9" style={{ top: "-10%", left: "-10%",  delay: 0   }} />
      <FloatBlob size={400} color="#06b6d4" style={{ top: "60%",  right: "-8%", delay: 1.5 }} />
      <FloatBlob size={350} color="#38bdf8" style={{ bottom: "5%", left: "20%", delay: 3   }} />

      <div className="relative z-10 text-center max-w-2xl w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280 }}
          className="inline-flex items-center gap-2 rounded-full bg-white border border-sky-200 px-4 py-1.5 text-xs font-bold text-sky-500 uppercase tracking-widest shadow-sm mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          {isOnlineMode ? "Multiplayer Ready" : "Local Play Mode"}
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
        >
          <motion.div
            animate={{ rotate: [-4, 4, -2, 2, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-sky-600 shadow-lg shadow-sky-200 mb-5"
          >
            <Bell size={38} className="text-white fill-white/20" />
          </motion.div>
          <h1 className="font-display text-6xl sm:text-7xl text-sky-950 mb-3">
            You Can't Say <span className="text-sky-600">"Umm!"</span>
          </h1>
          <p className="text-sky-500 text-xl mb-1">filler-word party game</p>
        </motion.div>

        {/* Mode selection */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Team Mode */}
          <motion.button
            onClick={() => navigate("/team")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className="group rounded-3xl bg-white border-2 border-sky-100 hover:border-sky-300 p-6 text-left shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-600 flex items-center justify-center mb-4 shadow-sm shadow-sky-200 group-hover:scale-110 transition-transform">
              <Users size={24} className="text-white" />
            </div>
            <h2 className="font-display text-2xl text-sky-950 mb-1">Team Mode</h2>
            <p className="text-sky-400 text-sm leading-snug mb-3">
              2–6 teams · Rule drafting · Each team uses their own device
            </p>
            <div className="flex items-center gap-1 text-sky-600 text-sm font-bold">
              Play <ChevronRight size={16} />
            </div>
          </motion.button>

          {/* Duel Mode */}
          <motion.button
            onClick={() => navigate("/duel")}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 18 }}
            className="group rounded-3xl bg-gradient-to-br from-violet-50 to-sky-50 border-2 border-violet-100 hover:border-violet-300 p-6 text-left shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center mb-4 shadow-sm shadow-violet-200 group-hover:scale-110 transition-transform">
              <Swords size={24} className="text-white" />
            </div>
            <h2 className="font-display text-2xl text-sky-950 mb-1">Duel Mode</h2>
            <p className="text-sky-400 text-sm leading-snug mb-3">
              1 vs 1 · Fast-paced · Head-to-head with skip limits
            </p>
            <div className="flex items-center gap-1 text-violet-600 text-sm font-bold">
              Duel <ChevronRight size={16} />
            </div>
          </motion.button>
        </motion.div>

        {!isOnlineMode && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-4 text-xs text-sky-300 text-center"
          >
            Add Firebase credentials in <code className="bg-sky-100 text-sky-600 px-1 rounded">.env.local</code> to unlock cross-device multiplayer
          </motion.p>
        )}

        {/* How to play grid */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {HOW_TO.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 + i * 0.07 }}
              className="rounded-2xl bg-white border border-sky-100 p-4 text-left shadow-sm"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${item.color}`}>
                <item.icon size={18} />
              </div>
              <p className="text-sky-900 font-bold text-sm">{item.label}</p>
              <p className="text-sky-400 text-xs mt-0.5">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
