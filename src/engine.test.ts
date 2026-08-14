import { describe, expect, it } from "vitest";
import {
  clampPhase,
  distribution,
  mulberry32,
  nearestEstimate,
  phaseDistance,
  phaseFromEnergy,
  qpeProbability,
  seededMeasure
} from "./engine";

const ancillaCounts = [2, 3, 4, 5, 6, 7, 8];
const representativePhases = [0, 0.000001, 0.123456, 0.5, 0.99, 1 - 1e-9, -0.125, 1.375];
const probabilityTolerance = 1e-12;

/**
 * Chi-square critical values at alpha = 0.001, indexed by degrees of freedom.
 * Every statistical assertion below runs over a fixed seed range, so each
 * statistic is a deterministic constant and cannot flake.
 */
const chiSquareCritical: Record<number, number> = {
  1: 10.828,
  15: 37.697,
  19: 43.82,
  21: 46.797,
  45: 82.72
};

function pearsonCorrelation(a: number[], b: number[]) {
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let covariance = 0;
  let varianceA = 0;
  let varianceB = 0;
  for (let i = 0; i < n; i++) {
    covariance += (a[i] - meanA) * (b[i] - meanB);
    varianceA += (a[i] - meanA) ** 2;
    varianceB += (b[i] - meanB) ** 2;
  }
  return covariance / Math.sqrt(varianceA * varianceB);
}

/**
 * Goodness of fit against the analytical distribution. Outcomes whose expected
 * count falls below five are pooled into one residual bin, the standard
 * validity condition for chi-square, which QPE tails would otherwise violate.
 */
function goodnessOfFit(phase: number, bits: number, samples: number) {
  const values = distribution(phase, bits);
  const total = values.reduce((sum, value) => sum + value.probability, 0);
  const counts = new Map<number, number>();
  for (let seed = 0; seed < samples; seed++) {
    const outcome = seededMeasure(phase, bits, seed).outcome;
    counts.set(outcome, (counts.get(outcome) ?? 0) + 1);
  }

  let statistic = 0;
  let degreesOfFreedom = -1;
  let pooledExpected = 0;
  let pooledObserved = 0;
  for (const value of values) {
    const expected = (value.probability / total) * samples;
    const observed = counts.get(value.outcome) ?? 0;
    if (expected >= 5) {
      statistic += (observed - expected) ** 2 / expected;
      degreesOfFreedom++;
    } else {
      pooledExpected += expected;
      pooledObserved += observed;
    }
  }
  if (pooledExpected > 0) {
    statistic += (pooledObserved - pooledExpected) ** 2 / pooledExpected;
    degreesOfFreedom++;
  }
  return { statistic, degreesOfFreedom };
}

describe("PhaseDial engine", () => {
  it.each([
    ["zero energy", 0, 3.2, 0],
    ["default positive energy", Math.PI / 4, 3.2, 0.4],
    ["negative energy", -Math.PI / 4, 3.2, 0.6],
    ["positive wrap", Math.PI / 2, 5, 0.25],
    ["negative wrap", -Math.PI / 2, 5, 0.75]
  ])("uses the positive adjoint-unitary convention for %s", (_case, energy, time, expected) => {
    expect(phaseFromEnergy(energy, time)).toBeCloseTo(expected);
  });

  it("locks the documented default phase and finite-precision estimate", () => {
    const phase = phaseFromEnergy(Math.PI / 4, 3.2);

    expect(phase).toBeCloseTo(0.4);
    expect(nearestEstimate(phase, 4)).toEqual({ index: 6, phase: 0.375, bits: "0110" });
  });

  it("wraps positive and negative phases into one turn", () => {
    expect(clampPhase(1.25)).toBeCloseTo(0.25);
    expect(clampPhase(-0.25)).toBeCloseTo(0.75);
  });

  it("finds the finite precision estimate", () => {
    expect(nearestEstimate(0.31, 3)).toEqual({ index: 2, phase: 0.25, bits: "010" });
  });

  it("wraps an estimate rounded beyond the final register cell", () => {
    expect(nearestEstimate(0.99, 3)).toEqual({ index: 0, phase: 0, bits: "000" });
  });

  it("measures phase error across the zero-one boundary", () => {
    expect(phaseDistance(0.99, 0)).toBeCloseTo(0.01);
    expect(phaseDistance(0, 0.99)).toBeCloseTo(0.01);
  });

  it("wraps inputs before measuring phase distance", () => {
    expect(phaseDistance(1.01, -0.01)).toBeCloseTo(0.02);
  });

  it("assigns certainty to an exactly representable phase", () => {
    expect(qpeProbability(0.375, 3, 3)).toBe(1);
    expect(qpeProbability(0.375, 2, 3)).toBeCloseTo(0);
  });

  it("conserves measurement probability", () => {
    const total = distribution(0.317, 6).reduce((sum, item) => sum + item.probability, 0);
    expect(Math.abs(total - 1)).toBeLessThan(1e-12);
  });

  it("samples only declared register outcomes", () => {
    const result = seededMeasure(0.317, 5, 7);
    expect(result.outcome).toBeGreaterThanOrEqual(0);
    expect(result.outcome).toBeLessThan(32);
    expect(result.bits).toHaveLength(5);
  });

  it.each(ancillaCounts)("maintains distribution invariants with %i ancillas", bits => {
    const size = 2 ** bits;

    for (const phase of representativePhases) {
      const values = distribution(phase, bits);

      expect(values).toHaveLength(size);
      values.forEach((value, outcome) => {
        expect(value.outcome).toBe(outcome);
        expect(value.bits).toHaveLength(bits);
        expect(Number.parseInt(value.bits, 2)).toBe(outcome);
        expect(Number.isFinite(value.probability)).toBe(true);
        expect(value.probability).toBeGreaterThanOrEqual(-probabilityTolerance);
        expect(value.probability).toBeLessThanOrEqual(1 + probabilityTolerance);
      });

      const total = values.reduce((sum, value) => sum + value.probability, 0);
      expect(total).toBeCloseTo(1, 8);
    }
  });

  it.each([2, 4, 8])("concentrates exact-grid phases on one outcome with %i ancillas", bits => {
    const size = 2 ** bits;
    const indices = [0, 1, size / 2, size - 1];

    for (const index of indices) {
      const phase = index / size;
      const values = distribution(phase, bits);

      expect(values[index].probability).toBe(1);
      values.forEach((value, outcome) => {
        if (outcome !== index) expect(value.probability).toBeCloseTo(0, 12);
      });
      expect(nearestEstimate(phase, bits)).toEqual({
        index,
        phase,
        bits: index.toString(2).padStart(bits, "0")
      });
    }
  });

  it.each(ancillaCounts)("keeps nearest estimates within half a cell with %i ancillas", bits => {
    const halfCell = 1 / (2 * 2 ** bits);
    const phases = [...representativePhases, halfCell, 1 - halfCell, 0.5 + halfCell];

    for (const phase of phases) {
      const estimate = nearestEstimate(phase, bits);
      expect(phaseDistance(phase, estimate.phase)).toBeLessThanOrEqual(halfCell + 1e-12);
    }
  });

  it.each([
    [0, 0],
    [0.1, 0.9],
    [0.25, 0.75],
    [-0.1, 1.1],
    [2.375, -1.625]
  ])("keeps circular distance symmetric and bounded for %f and %f", (a, b) => {
    const forward = phaseDistance(a, b);
    const reverse = phaseDistance(b, a);

    expect(forward).toBeCloseTo(reverse, 12);
    expect(forward).toBeGreaterThanOrEqual(0);
    expect(forward).toBeLessThanOrEqual(0.5);
  });

  it.each([
    [0, 1],
    [-0.25, 0.75],
    [1.375, 0.375]
  ])("assigns zero distance to equivalent wrapped phases %f and %f", (a, b) => {
    expect(phaseDistance(a, b)).toBeCloseTo(0, 12);
  });

  it("draws uniformly from consecutive integer seeds", () => {
    const bins = 20;
    const samples = 100000;
    const counts = new Array(bins).fill(0);

    for (let seed = 0; seed < samples; seed++) {
      counts[Math.min(bins - 1, Math.floor(mulberry32(seed)() * bins))]++;
    }

    const expected = samples / bins;
    const statistic = counts.reduce((sum, count) => sum + (count - expected) ** 2 / expected, 0);
    expect(statistic).toBeLessThan(chiSquareCritical[bins - 1]);
  });

  it("keeps consecutive integer seeds uncorrelated", () => {
    const draws = Array.from({ length: 100000 }, (_, seed) => mulberry32(seed)());
    const correlation = pearsonCorrelation(draws.slice(0, -1), draws.slice(1));

    expect(Math.abs(correlation)).toBeLessThan(0.05);
  });

  it.each([
    [0.4, 4],
    [0.317, 5],
    [0.99, 6],
    [0.123456, 3]
  ])("samples the analytical distribution for phase %f with %i ancillas", (phase, bits) => {
    const { statistic, degreesOfFreedom } = goodnessOfFit(phase, bits, 20000);
    const critical = chiSquareCritical[degreesOfFreedom];

    expect(critical).toBeDefined();
    expect(statistic).toBeLessThan(critical);
  });

  it("reproduces sampling for identical inputs and seed sequences", () => {
    const phase = 0.317;
    const bits = 5;
    const seeds = [0, 1, 2, 7, 19, 101];
    const firstRun = seeds.map(seed => seededMeasure(phase, bits, seed));
    const secondRun = seeds.map(seed => seededMeasure(phase, bits, seed));
    const declaredOutcomes = new Set(distribution(phase, bits).map(value => value.outcome));

    expect(secondRun).toEqual(firstRun);
    firstRun.forEach(result => expect(declaredOutcomes.has(result.outcome)).toBe(true));
  });
});
