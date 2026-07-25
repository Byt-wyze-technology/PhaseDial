import { describe, expect, it } from "vitest";
import { distribution, nearestEstimate, phaseFromEnergy } from "./engine";

describe("PhaseDial engine", () => {
  it("maps E·t to phase turns", () => {
    expect(phaseFromEnergy(Math.PI / 4, 4)).toBeCloseTo(0.5);
  });
  it("finds the finite precision estimate", () => {
    expect(nearestEstimate(0.31, 3)).toEqual({ index: 2, phase: 0.25, bits: "010" });
  });
  it("conserves measurement probability", () => {
    const total = distribution(0.317, 6).reduce((sum, item) => sum + item.probability, 0);
    expect(total).toBeCloseTo(1, 8);
  });
});
