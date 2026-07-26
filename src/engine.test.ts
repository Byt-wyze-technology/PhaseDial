import { describe, expect, it } from "vitest";
import {
  clampPhase,
  distribution,
  nearestEstimate,
  phaseFromEnergy,
  qpeProbability,
  seededMeasure
} from "./engine";

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
});
