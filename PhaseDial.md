

# PhaseDial Explorer

<p align="center">
  <strong>An interactive, mathematically faithful way to learn quantum phase estimation and Hamiltonian simulation.</strong>
</p>

<p align="center">
  <img alt="React 18" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white">
  <img alt="TypeScript 5.7" src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white">
  <img alt="Vite 6" src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white">
  <img alt="Tests: 94 passing" src="https://img.shields.io/badge/tests-94%20passing-38d996">
  <img alt="Browser tests: 5 passing" src="https://img.shields.io/badge/Chromium-5%20flows%20passing-4285F4?logo=googlechrome&logoColor=white">
  <img alt="Requirements: 91 of 91 passing" src="https://img.shields.io/badge/requirements-91%2F91%20PASS-66f5c2">
</p>

PhaseDial Explorer turns quantum phase estimation into something you can inspect one rotation at a time. It places classical frequency estimation beside quantum phase estimation, then connects the algorithm to Hamiltonian time evolution, controlled unitaries, phase kickback, the quantum Fourier transform, and the energy readout dial.

This is a teaching simulator — not a quantum-hardware interface. Exact state-vector simulation is used through small Hilbert spaces (up to 16 dimensions); larger examples use an explicitly labelled analytical model.

![PhaseDial desktop interface](artifacts/phasedial-desktop.png)

## What you will learn

By experimenting with the app, you can answer:

- Why are some quantum systems hard to simulate on ordinary computers?
- What is an energy eigenstate, and why does time evolution only rotate its phase?
- How is a physical energy level encoded into a quantum phase?
- What is the classical analogue of phase estimation?
- How does a controlled-unitary operation transfer a phase into an ancilla register?
- Why is the quantum Fourier transform the right tool to read a phase?
- How many ancilla qubits are needed for a given precision?
- Why does phase estimation require an eigenstate input?
- When does quantum simulation actually win over classical diagonalization?
- What happens if you run QPE on a superposition of eigenstates?

## The one idea you need

The energy levels of a quantum system are hidden inside its time evolution. If you prepare the system in an energy eigenstate and let it evolve, it does not change its probabilities — it only accumulates a phase proportional to its energy:

\[
|\psi(t)\rangle = e^{-i E t} |\psi(0)\rangle
\]

That phase is not directly measurable, but it *is* information. The trick is to let the system "tick" like a clock for carefully chosen durations, record those ticks in a quantum register, and then apply a quantum Fourier transform to read the accumulated phase like a position on a dial.

Here is the worked example this project uses throughout — a two-level system with energies \(E_0 = 0\) and \(E_1 = \pi/4\):

![Time evolution accumulates phase at a rate set by energy](artifacts/time_evolution_phase.png)

The state rotates on the unit circle at a rate fixed by its energy. After 8 units of time, the phase is \(2\pi\) — a full revolution. After 4 units, it is \(\pi\) — half a revolution.

Classically, if you wanted to know the frequency of a rotating signal, you would sample it at different times and run a Fourier transform. Quantum phase estimation does exactly the same thing, but the "signal" is the phase accumulated by a quantum system, and the "sampler" is a controlled sequence of unitary operations followed by an inverse QFT.

## How phase estimation works

Suppose a quantum system has an eigenstate \(|\psi\rangle\) with unknown eigenvalue \(e^{2\pi i \phi}\) of some unitary \(U\).

1. **Prepare an eigenstate.** The system is in an energy eigenstate \(|\psi\rangle\). Time evolution under \(U\) only adds a phase.
2. **Initialize ancilla qubits.** Create a uniform superposition in a control register:

\[
|+\rangle^{\otimes n} = \frac{1}{\sqrt{2^n}} \sum_{x=0}^{2^n-1} |x\rangle
\]

3. **Apply controlled powers of \(U\).** The control register encodes different evolution durations:

\[
|x\rangle |\psi\rangle \rightarrow |x\rangle U^x |\psi\rangle = e^{2\pi i \phi x} |x\rangle |\psi\rangle
\]

The phase is now encoded in the control register amplitudes as a complex exponential.
4. **Apply inverse Quantum Fourier Transform.** This converts the phase-encoded amplitudes into a basis state that points to the best \(n\)-bit approximation of \(\phi\).
5. **Measure the control register.** The result is a binary fraction that estimates the phase.

The app uses the exact finite-\(n\) precision rule rather than treating the estimate as infinitely precise. At 3 ancilla qubits, the displayed resolution is \(1/8\); at 8 qubits, it is \(1/256\).

## The bridge: classical ↔ quantum

PhaseDial and real quantum phase estimation are doing the *same dance*, one with classical signal processing and one with quantum circuits:

| Real QPE (quantum) | PhaseDial (classical, this repo) |
| --- | --- |
| Eigenstate evolves under Hamiltonian, accumulating phase | Complex exponential rotates on the unit circle at rate \(E\) |
| Controlled \(U^{2^k}\) operations sample at exponentially spaced times | Classical signal sampled at dyadic time intervals |
| **Quantum** Fourier Transform converts phase to basis state | Ordinary FFT converts time samples to frequency peaks |
| Measurement yields an \(n\)-bit phase estimate | Exact classical comparison reads the accumulated angle |
| Exponential precision in ancilla count; polynomial in evolution time | Instant on small systems, no speed-up |

Both routes centre the lesson on reading a hidden frequency from controlled time samples. The classical FFT only helps visualise the sampling structure.

## Explore the lab

The lab is built around one shared hidden-Hamiltonian problem:

- Choose a physical system (2-level, 4-level, or random Hermitian).
- Inspect its energy spectrum and eigenstates.
- Select an eigenstate or a superposition as input.
- Step through **Controlled-U**, **Phase Kickback**, and **Inverse QFT** separately.
- Run one complete QPE iteration, auto-run, pause, step back, reset, or measure.
- Change simulation speed.
- Show amplitudes, probabilities, phases, and energy spectrum independently.
- Show or hide equations and explanatory annotations.
- Compare classical frequency estimation and quantum phase estimation on the same problem.

Every operation records:

- what changed;
- why it changed;
- what stayed the same;
- the conserved quantity;
- how the operation compares with classical frequency estimation.

The synchronized timeline, teaching card, equations, control register, physical state, and visualizations all derive from the same canonical lab snapshot.

## Ten-module learning journey

| Module | Topic | Experiment |
| ---: | --- | --- |
| 1 | The simulation problem | Choose a Hamiltonian, inspect its spectrum, and see why exact diagonalisation scales badly. |
| 2 | Energy eigenstates | Pick an eigenstate and confirm that probabilities stay fixed under time evolution. |
| 3 | Time evolution as rotation | Watch the phase accumulate at rate \(E\). Inspect the unit-circle rotation. |
| 4 | The phase as information | Confirm that \(|\psi(t)\rangle\) and \(|\psi(0)\rangle\) are indistinguishable by measurement alone. |
| 5 | Classical frequency estimation | Sample a classical wave at different times and FFT to recover its frequency. |
| 6 | Controlled evolution | Apply \(U\) conditioned on an ancilla qubit and observe the phase kickback. |
| 7 | Phase kickback | Confirm that the target state is unchanged while the control register acquires the phase. |
| 8 | The quantum Fourier transform | Inspect the inverse QFT as a change of basis that turns phase into state. |
| 9 | The full QPE circuit | Run controlled powers, inverse QFT, and measurement as one pipeline. |
| 10 | Precision and scale | Change ancilla count and compare exact diagonalisation, analytical QPE, and finite-precision error. |

Each module has its own interactive checkpoint. The assessment set covers eigenstate identification, phase kickback, controlled-power sequencing, inverse QFT action, measurement interpretation, finite-precision error, classical-quantum analogy limits, and superposition input failure modes. Incorrect answers receive an explanation and can be retried.

## Scientific views

For exact states, the app exposes:

- Hamiltonian matrix and energy spectrum bar chart;
- time-evolution unit circle with phase accumulator;
- classical wave sampler with FFT spectrum;
- quantum circuit diagram with inspectable state after each gate;
- control-register amplitude bars before and after inverse QFT;
- physical-system state table (amplitude, probability, phase per basis state);
- target phase and measured approximation before/after comparisons;
- live equations;
- ancilla-register bitstring probability distribution;
- operation history and both classical/quantum query counters.

For systems beyond the exact limit, the interface switches visibly to the analytical model. It tracks the ideal phase, the expected measurement distribution, and the finite-precision error bound without fabricating a full state vector.

## Run locally

Requirements:

- Node.js with npm
- A modern browser

Install and start the development server:

```bash
npm install
npm run dev
```

Vite will print the local URL to open.

Create and preview a production build:

```bash
npm run build
npm run preview
```

## Test the project

Run the engine and React test suite:

```bash
npm test
```

Run the real-browser Chromium checks:

```bash
npx playwright install chromium
npm run test:e2e
```

The current recorded baseline is:

| Verification | Recorded result |
| --- | ---: |
| Engine and component tests | 94/94 passing |
| Chromium browser flows | 5/5 passing |
| Mandatory traceability requirements | 91/91 `PASS` |
| Strict TypeScript and production build | Passing |
| Production dependency audit | 0 reported vulnerabilities |

Browser tests cover three responsive viewports, keyboard workflows, visible focus, reduced motion, horizontal overflow, and rendered UTF-8 mathematical text.

## Project structure

```text
src/
├── engine/
│   ├── phasedial.ts         # Exact/analytical transitions, Hamiltonian sim, QPE, measurement
│   └── types.ts             # Canonical state and audit types
├── lab/
│   └── usePhaseDialLab.ts   # Shared lab state, history, auto-run, and timeline
├── content/
│   └── modules.ts           # Ten-module teaching content
├── App.tsx                  # Learning journey, lab, visualizations, and assessments
└── styles.css               # Responsive UI, animation, and reduced-motion behavior

e2e/
└── product.spec.ts          # Chromium workflow and viewport checks

artifacts/                   # Recorded desktop and tablet screenshots
```

The engine is deliberately separated from rendering. UI components observe canonical engine snapshots; they do not independently recreate the mathematics.

## Mathematical and product evidence

The repository includes an explicit implementation and audit trail:

- [Product implementation plan](PRODUCT_IMPLEMENTATION_PLAN.md) — phase-by-phase requirement ledger and evidence.
- [Product conformance report](PRODUCT_CONFORMANCE_REPORT.md) — final strict product verdict and assurance boundary.
- [Engine audit report](ENGINE_AUDIT_REPORT.md) — mathematical-engine audit.
- [Engine remediation plan](ENGINE_REMEDIATION_PLAN.md) — engine change history.
- [Manual and browser checks](PRODUCT_MANUAL_CHECKS.md) — responsive, keyboard, reduced-motion, and text evidence.
- [Product requirements](PhaseDial-Explorer.md) and [mathematical specification](type%20declarations.md) — governing source documents.

## Important boundaries

- The simulator does not connect to quantum hardware.
- Exact state-vector simulation is limited to small Hilbert spaces where classical memory permits. Larger systems use an explicitly labelled analytical model.
- Browser-flow evidence currently covers Chromium, not Firefox or WebKit.
- The automated accessibility check is not a WCAG certification and excludes jsdom color-contrast analysis.
- Assessment progress lasts for the mounted application session; it is not stored across reloads or devices.
- The classical FFT comparison is a structural analogue of the inverse QFT, not a reproduction of quantum query complexity.
- Phase estimation requires an eigenstate input. Running QPE on a superposition of eigenstates produces a mixed distribution, not a single phase estimate. The app includes this as an explicit failure-mode demonstration.
- No claim is made that quantum simulation outperforms classical methods for systems that fit in classical memory. The boundary is stated, not hidden.

## Contributing

Before changing behavior:

1. Identify the affected requirement IDs in `PRODUCT_IMPLEMENTATION_PLAN.md`.
2. Add or update acceptance evidence.
3. Preserve the exact/analytical boundary and canonical snapshot model.
4. Run `npm test`, `npm run test:e2e`, and `npm run build`.
5. Update the evidence ledger without overstating what was verified.

For mathematical changes, treat `type declarations.md` as authoritative where it overrides approximate examples in the product requirements.

---

**The tagline:** *See energy become a phase. Read the invisible dial.*