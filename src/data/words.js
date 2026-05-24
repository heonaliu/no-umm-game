// Word piles for the game
// Pile A: Adjectives / descriptors
// Pile B: Nouns / objects

export const PILE_A = [
  "Clumsy", "Angry", "Tiny", "Gigantic", "Fluffy",
  "Spicy", "Soggy", "Grumpy", "Elegant", "Wobbly",
  "Invisible", "Ancient", "Frozen", "Melting", "Sneaky",
  "Bouncy", "Crispy", "Furious", "Lazy", "Magical",
  "Nervous", "Peaceful", "Quirky", "Rusty", "Silky",
  "Twisted", "Urgent", "Vibrant", "Wiggly", "Zesty",
  "Bored", "Cheerful", "Dizzy", "Electric", "Fancy",
  "Greasy", "Haunted", "Itchy", "Jolly", "Knobby",
  "Lumpy", "Mysterious", "Noisy", "Oblong", "Prickly",
  "Restless", "Salty", "Trembling", "Undercooked", "Velvety",
  "Wacky", "Xenial", "Yawning", "Zealous", "Adorable",
  "Bitter", "Chubby", "Damp", "Enormous", "Floppy",
  "Gloomy", "Hollow", "Icy", "Jumbled", "Knitted",
  "Lopsided", "Muddy", "Neon", "Oily", "Puffy",
  "Ragged", "Shiny", "Tangled", "Unruly", "Vapid",
];

export const PILE_B = [
  "Jelly", "Robot", "Wizard", "Sandwich", "Volcano",
  "Penguin", "Library", "Hammock", "Tornado", "Cupcake",
  "Dragon", "Escalator", "Flamingo", "Garage", "Hamster",
  "Igloo", "Jacket", "Kettle", "Lantern", "Muffin",
  "Noodle", "Octopus", "Pretzel", "Raccoon", "Spatula",
  "Tugboat", "Umbrella", "Viking", "Walrus", "Xylophone",
  "Yoyo", "Zipper", "Avocado", "Blizzard", "Cactus",
  "Doughnut", "Elevator", "Fishbowl", "Glitter", "Hotdog",
  "Iceberg", "Jellybean", "Keyboard", "Lighthouse", "Marshmallow",
  "Narwhal", "Observatory", "Pancake", "Quarry", "Rhinoceros",
  "Saxophone", "Toaster", "Unicorn", "Vortex", "Waffles",
  "Yo-yo", "Zeppelin", "Asteroid", "Bathtub", "Compass",
  "Dungeon", "Eggplant", "Fortress", "Gondola", "Hurricane",
  "Imaginary", "Jackhammer", "Ketchup", "Labyrinth", "Mongoose",
  "Nebula", "Omelet", "Porcupine", "Quicksand", "Raft",
];

/**
 * Draw a random word pair (one from each pile)
 * Avoids repeating recently used pairs when possible
 */
export function drawWordPair(usedPairs = []) {
  const maxAttempts = 20;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const wordA = PILE_A[Math.floor(Math.random() * PILE_A.length)];
    const wordB = PILE_B[Math.floor(Math.random() * PILE_B.length)];
    const key = `${wordA}:${wordB}`;

    if (!usedPairs.includes(key)) {
      return { wordA, wordB, key };
    }
    attempts++;
  }

  // Fallback: just return random regardless
  const wordA = PILE_A[Math.floor(Math.random() * PILE_A.length)];
  const wordB = PILE_B[Math.floor(Math.random() * PILE_B.length)];
  return { wordA, wordB, key: `${wordA}:${wordB}` };
}
