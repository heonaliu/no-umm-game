// Rule cards for the game
// Each rule has an id, title, and description

export const ALL_RULES = [
  {
    id: "no-s-words",
    title: "No S-Words",
    description: "Cannot say any word that begins with the letter S",
    emoji: "🚫",
    difficulty: "hard",
  },
  {
    id: "no-its",
    title: "No \"It's\"",
    description: 'Cannot say the phrase "it\'s" at any point',
    emoji: "🙊",
    difficulty: "medium",
  },
  {
    id: "high-pitched",
    title: "Squeaky Voice",
    description: "Must speak in a high-pitched squeaky voice at all times",
    emoji: "🐭",
    difficulty: "easy",
  },
  {
    id: "eye-contact",
    title: "Eye Contact",
    description: "Must maintain direct eye contact with a teammate while describing",
    emoji: "👀",
    difficulty: "medium",
  },
  {
    id: "no-hands",
    title: "Hands Down",
    description: "Cannot use hand gestures or point at anything while describing",
    emoji: "🙅",
    difficulty: "medium",
  },
  {
    id: "clap-before",
    title: "Clap Start",
    description: "Must clap once before starting every new sentence",
    emoji: "👏",
    difficulty: "easy",
  },
  {
    id: "no-long-words",
    title: "Short Words Only",
    description: "Cannot say any word longer than 6 letters",
    emoji: "📏",
    difficulty: "hard",
  },
  {
    id: "whisper",
    title: "Whisper Mode",
    description: "Must whisper everything — no regular-volume speech allowed",
    emoji: "🤫",
    difficulty: "easy",
  },
  {
    id: "no-the",
    title: "No \"The\"",
    description: 'Cannot say the word "the"',
    emoji: "🚫",
    difficulty: "medium",
  },
  {
    id: "stand-on-one-foot",
    title: "One-Legged",
    description: "Must stand on one foot for the entire turn",
    emoji: "🦩",
    difficulty: "easy",
  },
  {
    id: "no-pointing",
    title: "No Pointing",
    description: "Cannot point at any object or person while describing",
    emoji: "☝️",
    difficulty: "easy",
  },
  {
    id: "robot-voice",
    title: "Robot Voice",
    description: "Must speak in a robotic monotone voice",
    emoji: "🤖",
    difficulty: "easy",
  },
  {
    id: "no-colors",
    title: "No Colors",
    description: "Cannot mention any color words",
    emoji: "🎨",
    difficulty: "medium",
  },
  {
    id: "no-is-are",
    title: "No \"Is\" or \"Are\"",
    description: 'Cannot say the words "is" or "are"',
    emoji: "❌",
    difficulty: "hard",
  },
  {
    id: "backwards-walk",
    title: "Walk Backwards",
    description: "Must walk backwards whenever you move during the turn",
    emoji: "🔄",
    difficulty: "easy",
  },
  {
    id: "no-adjectives-about-size",
    title: "No Size Words",
    description: 'Cannot say words like "big", "small", "huge", "tiny", "large"',
    emoji: "📐",
    difficulty: "hard",
  },
  {
    id: "spin-before",
    title: "Spin Before Guessing",
    description: "Guessers must spin in a circle before shouting each answer",
    emoji: "🌀",
    difficulty: "easy",
  },
  {
    id: "no-yes-no",
    title: "No Yes or No",
    description: 'Cannot say "yes" or "no" at any point',
    emoji: "🤐",
    difficulty: "medium",
  },
  {
    id: "accent",
    title: "Accent Mode",
    description: "Must speak in any accent other than your natural one",
    emoji: "🌍",
    difficulty: "easy",
  },
  {
    id: "no-like",
    title: "No \"Like\"",
    description: 'Cannot say the word "like" in any context',
    emoji: "💬",
    difficulty: "medium",
  },
  {
    id: "slow-motion",
    title: "Slow Motion",
    description: "Must speak at half your normal speed",
    emoji: "🐌",
    difficulty: "easy",
  },
  {
    id: "no-question",
    title: "No Questions",
    description: "Cannot ask any questions during the description",
    emoji: "❓",
    difficulty: "medium",
  },
  {
    id: "must-rhyme",
    title: "Rhyme Time",
    description: "Every sentence must end with a word that rhymes with the previous sentence's last word",
    emoji: "🎵",
    difficulty: "hard",
  },
  {
    id: "no-numbers",
    title: "No Numbers",
    description: "Cannot say any number (words or digits)",
    emoji: "🔢",
    difficulty: "medium",
  },
  {
    id: "repeat-twice",
    title: "Repeat Twice",
    description: "Must repeat each word they say exactly twice",
    emoji: "🔁",
    difficulty: "medium",
  },
  {
    id: "delayed-echo",
    title: "Delayed Echo",
    description: "Must repeat the last 2 words the guessers said before your next sentence",
    emoji: "🗣️",
    difficulty: "hard",
  },
  {
    id: "alternate-volume",
    title: "Alternate Volume",
    description: "Must speak in a different volume for every sentence (e.g. loud, quiet, medium, etc.)",
    emoji: "🔊",
    difficulty: "easy",
  },
  {
    id: "inspirational",
    title: "Inspirational",
    description: "Must speak in an inspirational tone",
    emoji: "💪",
    difficulty: "easy",
  },
];

/**
 * Draw n unique random rule cards from the pool
 */
export function drawRules(count = 6, excludeIds = []) {
  const available = ALL_RULES.filter(r => !excludeIds.includes(r.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Shuffle the full rule deck and return it
 */
export function shuffleRules() {
  return [...ALL_RULES].sort(() => Math.random() - 0.5);
}
