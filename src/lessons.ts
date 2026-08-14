/**
 * Lesson content for the Learn section.
 *
 * Every figure quoted in `observe` is produced by the engine in `engine.ts` at
 * the state described by `setup`, so a lesson cannot drift from the simulator
 * without the numbers visibly disagreeing. Adding a lesson requires no React.
 */

export type LessonSetup = {
  systemIndex?: number;
  bits?: number;
  time?: number;
  stageIndex?: number;
  /** Element id to scroll to. Defaults to the lab. */
  scrollTo?: string;
};

export type Lesson = {
  title: string;
  body: string;
  /** What to watch once the setup is applied. Quotes real engine output. */
  observe: string;
  action: string;
  setup: LessonSetup;
};

export const lessons: Lesson[] = [
  {
    title: "The simulation problem",
    body:
      "Chemistry is mostly a question about energy: what are a molecule's allowed energy levels? " +
      "For anything larger than a few atoms that question is out of reach classically, because the " +
      "state you would have to write down grows exponentially with the number of particles. Quantum " +
      "phase estimation takes a different route. It does not compute the energy. It measures it.",
    observe:
      "The four-level preset stands in for a molecule. Each level is an energy that QPE could read, one at a time.",
    action: "Load the four-level system",
    setup: { systemIndex: 2, stageIndex: 0 }
  },
  {
    title: "Energy eigenstates",
    body:
      "An energy eigenstate is a state with one definite energy. Left alone it never changes shape — " +
      "the only thing that moves is its phase, which turns at a steady rate. That is what makes it " +
      "readable. A state with one energy is a clock with one rate.",
    observe:
      "At the prepare stage the dial is a single hand turning at a single rate, because the state holds a single energy.",
    action: "Prepare an eigenstate",
    setup: { systemIndex: 0, stageIndex: 0 }
  },
  {
    title: "Time evolution as rotation",
    body:
      "Let the state evolve for a time t and its phase advances by φ = Et / 2π turns. Energy sets the " +
      "speed of the hand, time sets how long it turns. Nothing else is happening — this is the entire " +
      "physical content of the first stage.",
    observe:
      "E = 0.785 for t = 3.2 gives φ = 0.400 turns. Double the time to 6.4 and the phase doubles to 0.800. Press play to watch it sweep.",
    action: "Set E = 0.785, t = 3.2",
    setup: { systemIndex: 0, time: 3.2, stageIndex: 0 }
  },
  {
    title: "The phase as information",
    body:
      "The energy is now hidden inside an angle. If you know how far the hand has turned and how long " +
      "it turned for, you can recover the energy that drove it. Everything after this point exists for " +
      "one purpose: to read that angle.",
    observe:
      "Change the system and the angle changes with the energy. E = 1.930 gives 0.983 turns; E = 2.410 gives 0.227 turns.",
    action: "Switch to a different energy",
    setup: { systemIndex: 1, stageIndex: 0 }
  },
  {
    title: "Classical frequency estimation",
    body:
      "You already know how to solve this classically. Sample a rotating signal at many different times, " +
      "run a Fourier transform over the samples, and read off the dominant frequency. Quantum phase " +
      "estimation is the same idea with a different way of collecting the samples.",
    observe:
      "The bridge section places both methods side by side. The structure is shared; only the sampling differs.",
    action: "Compare the two methods",
    setup: { scrollTo: "bridge" }
  },
  {
    title: "Controlled evolution",
    body:
      "Instead of one long evolution, QPE runs many lengths at once. Each ancilla qubit controls a " +
      "different number of applications: the first sees the evolution once, the second twice, the third " +
      "four times, doubling all the way up. Together they measure the same angle at many magnifications.",
    observe:
      "At φ = 0.400 the ancillas turn by 0.40, 0.80, 1.60 and 3.20 turns. Each is the same phase multiplied by a power of two.",
    action: "Show controlled powers",
    setup: { systemIndex: 0, bits: 4, stageIndex: 2 }
  },
  {
    title: "Phase kickback",
    body:
      "Here is the trick the algorithm turns on. The controlled operation is meant to act on the target, " +
      "but the target is an eigenstate, so it comes back unchanged apart from a phase. That phase has " +
      "nowhere to go except onto the control qubit that triggered it. The register you were going to " +
      "measure anyway is where the answer lands.",
    observe:
      "At the kickback stage the target holds still while the ancillas pick up the rotation.",
    action: "Watch the kickback",
    setup: { systemIndex: 0, stageIndex: 2 }
  },
  {
    title: "The quantum Fourier transform",
    body:
      "The ancillas now hold the phase smeared across many qubits as a pattern of rotations. The inverse " +
      "quantum Fourier transform makes those rotations interfere with each other. They cancel almost " +
      "everywhere and reinforce at one place: the binary number closest to the phase.",
    observe:
      "After the inverse QFT the probability chart shows one tall bar with small ones either side. That shape is the interference.",
    action: "Run the inverse QFT",
    setup: { systemIndex: 0, stageIndex: 3 }
  },
  {
    title: "The full QPE circuit",
    body:
      "That is the whole algorithm. Prepare an eigenstate, put the ancillas into superposition, kick the " +
      "phase back onto them with controlled evolution, undo the Fourier pattern, and measure. Five " +
      "stages with one purpose — turning a hidden angle into a number you can read off.",
    observe:
      "Step through all five stages with Next operation and watch the same quantum state carried from one to the next.",
    action: "Start from stage one",
    setup: { systemIndex: 0, stageIndex: 0 }
  },
  {
    title: "Precision and scale",
    body:
      "n ancilla qubits divide the dial into 2ⁿ positions, so the answer you get is the nearest grid " +
      "point rather than the exact phase. More qubits means a finer grid. But a phase that falls between " +
      "two grid points spreads its probability across both, so a finer ruler can give you a less certain " +
      "single reading — precision and confidence are not the same thing.",
    observe:
      "φ = 0.400 read with 3 bits gives 0.375, error 0.025, with 87.7% on the peak. With 4 bits it still reads 0.375 — but 0.400 now sits nearly halfway between grid points and the peak falls to 57.4%. With 8 bits it reads 0.398438, error 0.001562.",
    action: "Read it with 3 bits",
    setup: { systemIndex: 0, bits: 3, time: 3.2, stageIndex: 4 }
  }
];
