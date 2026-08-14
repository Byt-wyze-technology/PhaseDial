export type Stage = "prepare" | "superposition" | "kickback" | "qft" | "measure";

export const stages: { id: Stage; label: string; short: string }[] = [
  { id: "prepare", label: "Prepare eigenstate", short: "01" },
  { id: "superposition", label: "Create superposition", short: "02" },
  { id: "kickback", label: "Controlled evolution", short: "03" },
  { id: "qft", label: "Inverse QFT", short: "04" },
  { id: "measure", label: "Measure phase", short: "05" }
];

export const clampPhase = (phase: number) => ((phase % 1) + 1) % 1;

export function phaseDistance(a: number, b: number): number {
  const delta = Math.abs(clampPhase(a) - clampPhase(b));
  return Math.min(delta, 1 - delta);
}

/** QPE eigenphase of U₊(t) = exp(+iHt), using natural units with ℏ = 1. */
export function phaseFromEnergy(energy: number, time: number) {
  return clampPhase((energy * time) / (2 * Math.PI));
}

export function nearestEstimate(phase: number, bits: number) {
  const size = 2 ** bits;
  const index = Math.round(clampPhase(phase) * size) % size;
  return { index, phase: index / size, bits: index.toString(2).padStart(bits, "0") };
}

export function qpeProbability(phase: number, outcome: number, bits: number) {
  const size = 2 ** bits;
  const delta = clampPhase(phase) - outcome / size;
  if (Math.abs(delta) < 1e-12) return 1;
  const top = Math.sin(Math.PI * size * delta);
  const bottom = size * Math.sin(Math.PI * delta);
  return Math.min(1, (top / bottom) ** 2);
}

export function distribution(phase: number, bits: number) {
  const size = 2 ** bits;
  return Array.from({ length: size }, (_, outcome) => ({
    outcome,
    bits: outcome.toString(2).padStart(bits, "0"),
    probability: qpeProbability(phase, outcome, bits)
  }));
}

/**
 * Deterministic 32-bit generator (mulberry32, public domain). Its output mixing
 * keeps the first draw well distributed across consecutive integer seeds, which
 * is how the interface advances the measurement seed. Not cryptographic.
 */
export function mulberry32(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Draws one outcome by inverse CDF over the analytical distribution. */
export function seededMeasure(phase: number, bits: number, seed: number) {
  const values = distribution(phase, bits);
  let cursor = mulberry32(seed)() * values.reduce((s, v) => s + v.probability, 0);
  for (const value of values) {
    cursor -= value.probability;
    if (cursor <= 0) return value;
  }
  return values.at(-1)!;
}
