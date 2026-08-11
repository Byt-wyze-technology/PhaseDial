import { describe, expect, it } from "vitest";
import {
  clampPhase,
  distribution,
  nearestEstimate,
  phaseDistance,
  phaseFromEnergy,
  qpeProbability,
  seededMeasure
} from "./engine";

const ancillaCounts = [2, 3, 4, 5, 6, 7, 8];
const representativePhases = [0, 0.000001, 0.123456, 0.5, 0.99, 1 - 1e-9, -0.125, 1.375];
const probabilityTolerance = 1e-12;

describe("PhaseDial engine", () => {
  it("maps E·t to phase turns", () => {
    expect(phaseFromEnergy(Math.PI / 4, 4)).toBeCloseTo(0.5);
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
    expect(total).toBeCloseTo(1, 8);
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
