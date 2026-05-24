import { useMemo, useRef, useEffect } from "react";
import { Star, Flame } from "lucide-react";
import { BoardCell } from "./BoardCell";
import { useGameStore, isDangerZone, DANGER_ZONE_SIZE, YELLOW_INTERVAL } from "../../store/gameStore";

const CELLS_PER_ROW = 10;

export function GameBoard() {
  const teams            = useGameStore((s) => s.teams);
  const boardLength      = useGameStore((s) => s.boardLength);
  const currentTeamIndex = useGameStore((s) => s.currentTeamIndex);
  const activeCellRef    = useRef(null);
  const totalCells       = boardLength + 1;

  const getCellType = (pos) => {
    if (pos === 0)           return "start";
    if (pos === boardLength) return "finish";
    if (isDangerZone(pos, boardLength)) return "danger";
    if (pos % YELLOW_INTERVAL === 0)    return "yellow";
    return "normal";
  };

  const rows = useMemo(() => {
    const cells = Array.from({ length: totalCells }, (_, i) => i);
    const rowCount = Math.ceil(totalCells / CELLS_PER_ROW);
    const built = [];
    for (let r = 0; r < rowCount; r++) {
      const start = r * CELLS_PER_ROW;
      let row = cells.slice(start, Math.min(start + CELLS_PER_ROW, totalCells));
      if (r % 2 === 1) row = [...row].reverse();
      built.push(row);
    }
    return built.reverse();
  }, [totalCells]);

  const pawnMap = useMemo(() => {
    const map = {};
    teams.forEach((team) => {
      const pos = team.position;
      if (!map[pos]) map[pos] = [];
      map[pos].push({ teamId: team.id, teamName: team.name, emoji: team.pawn });
    });
    return map;
  }, [teams]);

  const activePos = teams[currentTeamIndex]?.position ?? 0;
  useEffect(() => { activeCellRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [activePos]);

  return (
    <div className="w-full rounded-2xl border border-sky-100 bg-white shadow-sm p-4">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-amber-700">
          <Star size={13} className="fill-amber-400 text-amber-500" />
          Rule Space (every {YELLOW_INTERVAL}th)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-red-600">
          <Flame size={13} />
          Danger Zone (last {DANGER_ZONE_SIZE})
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-col gap-1.5 overflow-x-auto pb-1">
        {rows.map((row, ri) => (
          <div key={ri} className="flex gap-1.5">
            {row.map((pos) => {
              const isHere = pos === activePos;
              return (
                <div key={pos} ref={isHere ? activeCellRef : null}>
                  <BoardCell position={pos} type={getCellType(pos)} pawns={pawnMap[pos] ?? []} isActive={isHere} />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Team legend */}
      <div className="mt-3 pt-3 border-t border-sky-50 flex gap-3 flex-wrap">
        {teams.map((team, i) => (
          <div key={team.id} className="flex items-center gap-1.5 text-xs">
            <span className="text-base">{team.pawn}</span>
            <span className="font-bold" style={{ color: team.color?.hex }}>{team.name}</span>
            <span className="text-sky-300">·{team.position}</span>
            {i === currentTeamIndex && (
              <span className="text-sky-600 font-bold text-[10px] bg-sky-100 px-1.5 py-0.5 rounded-full">ACTIVE</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
