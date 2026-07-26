# Product Vision

## Purpose

PhaseDial is an interactive teaching simulator for quantum phase estimation
(QPE). It helps learners connect four views of the same idea:

1. energy as the rate of phase accumulation;
2. time evolution as rotation on a unit circle;
3. controlled evolution as phase kickback;
4. the inverse quantum Fourier transform as a phase readout.

The product succeeds when a learner can explain how an energy eigenvalue becomes
a finite classical bitstring, and can also explain why that answer has limited
precision.

## Audience

The primary audience is a learner who is comfortable with complex numbers and
basic linear algebra but has not yet developed intuition for QPE. The interface
should remain useful to instructors and technically experienced readers who
want a compact visual demonstration.

## Design principles

### One state, several views

Displayed equations, the phase dial, the control register, measurement
probabilities, and explanatory text should derive from one canonical simulator
snapshot.

### Mathematics before mystique

The interface should make phase wrapping, finite precision, and probabilistic
measurement explicit. It should not imply that a browser animation is quantum
hardware.

### Exploration before assessment

Controls should invite a learner to vary one parameter, form a prediction, and
inspect the result. Explanations should tell the learner what changed and what
remained invariant.

### Honest boundaries

The project should distinguish:

- implemented calculations;
- pedagogical illustrations;
- future product goals;
- claims that would require external hardware or benchmark evidence.

## Implemented release

The current release provides:

- three pedagogical energy-spectrum presets;
- adjustable evolution time;
- two to eight ancilla bits;
- a five-stage QPE walkthrough;
- a phase dial and control-register illustration;
- an ideal finite-register measurement distribution;
- sampled bitstring readouts;
- a classical-frequency/QPE conceptual comparison;
- responsive and reduced-motion styling.

The implementation calculates an ideal phase and ideal QPE output distribution.
It does not construct a complete joint quantum state or execute gates on quantum
hardware.

## Learning journey

The interface names ten learning topics:

1. the classical simulation problem;
2. energy eigenstates;
3. time evolution as rotation;
4. phase as information;
5. classical frequency estimation;
6. controlled evolution;
7. phase kickback;
8. the inverse QFT;
9. the complete QPE sequence;
10. finite precision and scale.

The current release uses one shared lab and maps topic links to its closest
stage. Dedicated lesson pages and assessments remain roadmap items.

## Out of scope for the current release

- quantum-hardware connectivity;
- noisy-device simulation;
- arbitrary Hamiltonian matrix entry;
- numerical diagonalization;
- complete state-vector evolution;
- eigenstate-superposition input;
- persistence, accounts, or cloud storage;
- claims of quantum advantage.

See [the roadmap](ROADMAP.md) for possible future work.
