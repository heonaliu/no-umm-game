/**
 * DuelProgressBoard — 1v1 race-track progress display.
 *
 * Shows two parallel tracks with player pawns, danger zone indicator,
 * and yellow rule-space markers. Designed to be compact and readable
 * at a glance during fast-paced duel play.
 */

import { motion } from "framer-motion";
import { Flame, Star } from "lucide-react";
import { useDuelStore, isDangerZone, DANGER_ZONE_SIZE, YELLOW_INTERVAL } from "../../store/duelStore";

function Track({ player, boardLength, isActive }) {
  const pct         = Math.min((player.position / boardLength) * 100, 100);
  const inDanger    = isDangerZone(player.position, boardLength);
  const dangerStart = ((boardLength - DANGER_ZONE_SIZE) / boardLength) * 100;

  // Yellow space positions as percentages
  const yellowPcts = [];
  for (let i = YELLOW_INTERVAL; i < boardLength; i += YELLOW_INTERVAL) {
    yellowPcts.push((i / boardLength) * 100);
  }

  return (
    <div className={`rounded-2xl p-3 border-2 transition-all ${
      isActive ? "border-sky-300 bg-sky-50" : "border-sky-100 bg-white"
    }`}>
      {/* Player header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{player.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm text-sky-900 truncate">{player.name}</p>
          <p className="text-[10px] text-sky-400">
            Space {player.position} / {boardLength}
            {inDanger && <span className="text-red-500 font-bold ml-1">🔥 Danger</span>}
          </p>
        </div>
        {isActive && (
          <span className="text-[10px] font-bold text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded-full shrink-0">
            SPEAKING
          </span>
        )}
        {player.activeRules?.length > 0 && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0">
            {player.activeRules.length} rule{player.activeRules.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Track bar */}
      <div className="relative h-5 rounded-full bg-sky-100 overflow-hidden">
        {/* Danger zone tint */}
        <div
          className="absolute inset-y-0 right-0 bg-red-100 rounded-r-full"
          style={{ width: `${100 - dangerStart}%` }}
        />

        {/* Yellow space ticks */}
        {yellowPcts.map((p) => (
          <div
            key={p}
            className="absolute inset-y-0 w-0.5 bg-amber-300/60"
            style={{ left: `${p}%` }}
          />
        ))}

        {/* Progress fill */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: inDanger ? "#ef4444" : "#0ea5e9" }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        />

        {/* Pawn marker */}
        {player.position > 0 && (
          <motion.div
            className="absolute top-0 -translate-x-1/2 -translate-y-0 flex items-center justify-center w-5 h-5 rounded-full bg-white border-2 border-sky-400 text-xs shadow-sm z-10"
            animate={{ left: `${pct}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            {player.emoji}
          </motion.div>
        )}
      </div>

      {/* Active rules (compact) */}
      {player.activeRules?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {player.activeRules.map((rule) => (
            <span
              key={rule.id}
              className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full"
            >
              <Star size={9} className="fill-amber-400 text-amber-500" />
              {rule.title}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function DuelProgressBoard() {
  const players          = useDuelStore((s) => s.players);
  const activePlayerIndex = useDuelStore((s) => s.activePlayerIndex);
  const boardLength       = useDuelStore((s) => s.boardLength);
  const inDangerAny       = players.some((p) => isDangerZone(p.position, boardLength));

  return (
    <div className="space-y-2">
      {inDangerAny && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-bold px-1">
          <Flame size={12} className="animate-pulse" />
          Danger Zone active — no um/uh from EITHER player
        </div>
      )}
      {players.map((player, i) => (
        <Track
          key={player.id}
          player={player}
          boardLength={boardLength}
          isActive={i === activePlayerIndex}
        />
      ))}
    </div>
  );
}
