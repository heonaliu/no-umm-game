// Preset team colors & pawns
// Each team can pick a color and a pawn emoji

export const TEAM_COLORS = [
  { id: "violet",  label: "Violet",  hex: "#8b5cf6", bg: "bg-violet-500",  border: "border-violet-400",  text: "text-violet-300",  ring: "ring-violet-400"  },
  { id: "pink",    label: "Pink",    hex: "#ec4899", bg: "bg-pink-500",    border: "border-pink-400",    text: "text-pink-300",    ring: "ring-pink-400"    },
  { id: "cyan",    label: "Cyan",    hex: "#06b6d4", bg: "bg-cyan-500",    border: "border-cyan-400",    text: "text-cyan-300",    ring: "ring-cyan-400"    },
  { id: "amber",   label: "Amber",   hex: "#f59e0b", bg: "bg-amber-500",   border: "border-amber-400",   text: "text-amber-300",   ring: "ring-amber-400"   },
  { id: "green",   label: "Green",   hex: "#10b981", bg: "bg-emerald-500", border: "border-emerald-400", text: "text-emerald-300", ring: "ring-emerald-400" },
  { id: "red",     label: "Red",     hex: "#ef4444", bg: "bg-red-500",     border: "border-red-400",     text: "text-red-300",     ring: "ring-red-400"     },
];

export const TEAM_PAWNS = [
  "🦄", "🐉", "🦊", "🐸", "🐙", "🦁", "🐨", "🦋",
  "🦖", "🐳", "🐺", "🦝", "🐻", "🦑", "🐬", "🦅",
];

/**
 * Generate a default team config for n teams
 */
export function generateDefaultTeams(count) {
  const teams = [];
  for (let i = 0; i < count; i++) {
    teams.push({
      id: `team-${i}`,
      name: `Team ${i + 1}`,
      color: TEAM_COLORS[i % TEAM_COLORS.length],
      pawn: TEAM_PAWNS[i % TEAM_PAWNS.length],
      position: 0,
      score: 0,
      ruleCards: [],         // cards dealt during draft phase
      activeRules: [],       // rules currently in effect
    });
  }
  return teams;
}

/**
 * Generate a unique short room code (4 chars, uppercase alphanumeric)
 */
export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0,O,1,I)
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
