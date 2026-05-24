/**
 * sounds.js — Web Audio API sound effects.
 * No audio files required — all sounds are generated via oscillators.
 */

/** Cached AudioContext (reused across calls to avoid iOS restrictions). */
let _ctx = null;

function getCtx() {
  if (!_ctx || _ctx.state === "closed") {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Some browsers suspend the context until user interaction
  if (_ctx.state === "suspended") _ctx.resume();
  return _ctx;
}

/**
 * playDing — bright, resonant bell/ding.
 * Uses three layered sine oscillators at harmonic frequencies
 * with exponential gain decay for a natural bell tail.
 */
export function playDing() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    const harmonics = [
      { freq: 1318, gain: 0.55, decay: 1.4 }, // E6 — bright attack
      { freq: 1760, gain: 0.30, decay: 1.1 }, // A6 — warmth
      { freq: 2637, gain: 0.15, decay: 0.7 }, // E7 — shimmer
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc  = ctx.createOscillator();
      const gain_ = ctx.createGain();

      osc.connect(gain_);
      gain_.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.value = freq;

      // Snappy attack, smooth tail
      gain_.gain.setValueAtTime(0, now);
      gain_.gain.linearRampToValueAtTime(gain, now + 0.01);
      gain_.gain.exponentialRampToValueAtTime(0.001, now + decay);

      osc.start(now);
      osc.stop(now + decay + 0.05);
    });
  } catch {
    // Silent fallback (unsupported browser)
  }
}

/**
 * playCorrect — short ascending two-tone chime for a correct guess.
 */
export function playCorrect() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    [[880, 0], [1174.7, 0.12]].forEach(([freq, offset]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.3, now + offset + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.5);
      osc.start(now + offset);
      osc.stop(now + offset + 0.55);
    });
  } catch {
    // Silent fallback
  }
}
