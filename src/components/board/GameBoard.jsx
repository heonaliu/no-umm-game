/**
 * GameBoard — the main visual board rendered as a snake/zigzag path.
 *
 * Layout: cells snake left-to-right, then right-to-left (alternating rows)
 * so that cell 0 is bottom-left and the finish is top-left.
 * Row width is configurable (default 10 cells per row).
 */

import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { BoardCell } from "./BoardCell";
import { useGameStore, isDangerZone, DANGER_ZONE_SIZE, YELLOW_INTERVAL } from "../../store/gameStore";
import clsx from "clsx";

const CELLS_PER_ROW = 10;

export function GameBoard() {
  const teams = useGameStore((s) => s.teams);
  const boardLength = useGameStore((s) => s.boardLength);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const activeCellRef = useRef(null);

  // Build cells array: total = boardLength + 1 (0..boardLength)
  const totalCells = boardLength + 1;

  // Determine cell type
  const getCellType = (pos) => {
    if (pos === 0)           return "start";
    if (pos === boardLength) return "finish";
    if (isDangerZone(pos, boardLength)) return "danger";
    if (pos % YELLOW_INTERVAL === 0)    return "yellow";
    return "normal";
  };

  // Build rows for snake layout
  const rows = useMemo(() => {
    const cells = Array.from({ length: totalCells }, (_, i) => i);
    const rowCount = Math.ceil(totalCells / CELLS_PER_ROW);
    const builtRows = [];

    for (let r = 0; r < rowCount; r++) {
      const start = r * CELLS_PER_ROW;
      const end = Math.min(start + CELLS_PER_ROW, totalCells);
      let row = cells.slice(start, end);
      // Even rows: left→right; odd rows: right→left (snake)
      if (r % 2 === 1) row = [...row].reverse();
      builtRows.push(row);
    }

    // Reverse so row 0 is at the bottom
    return builtRows.reverse();
  }, [totalCells]);

  // Build a map: position → pawns on that cell
  const pawnMap = useMemo(() => {
    const map = {};
    teams.forEach((team) => {
      const pos = team.position;
      if (!map[pos]) map[pos] = [];
      map[pos].push({ teamId: team.id, teamName: team.name, emoji: team.pawn });
    });
    return map;
  }, [teams]);

  const activeTeamPos = teams[currentTeamIndex]?.position ?? 0;

  // Auto-scroll to keep active pawn visible
  useEffect(() => {
    if (activeCellRef.current) {
      activeCellRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeTeamPos]);

  return (
    <div className="w-full overflow-auto rounded-2xl border border-white/10 bg-black/30 p-4">
      {/* Danger Zone label */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-red-400 text-sm font-bold animate-pulse">🔥 DANGER ZONE</span>
        <span className="text-white/30 text-xs">(last {DANGER_ZONE_SIZE} spaces)</span>
        <div className="ml-auto flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-yellow-400/40 border border-yellow-400/80 inline-block"/>
            Rule Space
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/70 inline-block"/>
            Danger
          </span>
        </div>
      </div>

      {/* Board grid */}
      <div className="flex flex-col gap-1.5">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1.5 justify-start">
            {row.map((pos) => {
              const isActivePawnHere = pos === activeTeamPos;
              return (
                <div
                  key={pos}
                  ref={isActivePawnHere ? activeCellRef : null}
                >
                  <BoardCell
                    position={pos}
                    type={getCellType(pos)}
                    pawns={pawnMap[pos] ?? []}
                    isActive={isActivePawnHere}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend row */}
      <div className="mt-3 pt-3 border-t border-white/10 flex gap-4 flex-wrap">
        {teams.map((team, i) => (
          <div key={team.id} className="flex items-center gap-1.5 text-xs">
            <span className="text-base">{team.pawn}</span>
            <span
              className="font-bold"
              style={{ color: team.color?.hex ?? "#fff" }}
            >
              {team.name}
            </span>
            <span className="text-white/40">— space {team.position}</span>
            {i === currentTeamIndex && (
              <span className="text-violet-400 font-bold">▶ ACTIVE</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
