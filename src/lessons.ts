/**
 * Lesson content for the Learn section.
 *
 * Written for someone meeting quantum phase estimation for the first time. Plain
 * words first, technical names introduced only once there is something to attach
 * them to. Figures quoted here are ones the simulator produces at the state in
 * `setup`, so a lesson and the lab cannot quietly disagree.
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
  /** What to watch once the setup is applied. */
  observe: string;
  action: string;
  setup: LessonSetup;
};

export const lessons: Lesson[] = [
  {
    title: "The simulation problem",
    body:
      "Why bother with any of this? Chemistry comes down to one question more than any other: " +
      "what energies can a molecule have? For anything bigger than a few atoms, an ordinary " +
      "computer cannot work that out. The sums grow out of hand far too quickly. Quantum phase " +
      "estimation gets to the answer a different way. It does not calculate the energy. It measures it.",
    observe:
      "The four-level system stands in for a molecule. Each line in the spectrum is an energy this method could read, one at a time.",
    action: "Load the four-level system",
    setup: { systemIndex: 2, stageIndex: 0 }
  },
  {
    title: "Energy eigenstates",
    body:
      "Some states have one clean energy and nothing else mixed in. Leave one alone and it does not " +
      "turn into anything else. The only thing that moves is its phase, which turns steadily, like " +
      "the hand of a clock. One energy gives you one clock, turning at one speed. That is what makes " +
      "it readable at all. The formal name for a state like this is an energy eigenstate.",
    observe:
      "At the first step the dial shows a single hand turning at a single speed, because the state holds a single energy.",
    action: "Show me one clean energy",
    setup: { systemIndex: 0, stageIndex: 0 }
  },
  {
    title: "Time evolution as rotation",
    body:
      "How fast does the hand turn? The energy decides that. How far has it got? That depends on how " +
      "long you leave it running. More energy means a faster clock. More time means further round the " +
      "dial. That is the whole of what happens at this stage — nothing else is going on.",
    observe:
      "Left running for 3.2 seconds, the hand reaches 0.4 of a turn. Leave it twice as long and it gets twice as far. Press play to watch it go round.",
    action: "Set it running",
    setup: { systemIndex: 0, time: 3.2, stageIndex: 0 }
  },
  {
    title: "The phase as information",
    body:
      "Here is why that matters. The energy is now written down as an angle. If you can see how far " +
      "the hand has moved, and you know how long it was moving for, you can work backwards to the " +
      "energy that drove it. Everything the algorithm does from this point on has one job: read that angle.",
    observe:
      "Switch between the systems. Each one holds a different energy, so each one leaves the hand pointing somewhere different.",
    action: "Try a different energy",
    setup: { systemIndex: 1, stageIndex: 0 }
  },
  {
    title: "Classical frequency estimation",
    body:
      "You already know how to do this in ordinary life. If something is spinning and you want to know " +
      "how fast, you look at it at a few different moments and work it out from what you saw. Quantum " +
      "phase estimation is the same idea. The only real difference is how it manages to get a look.",
    observe:
      "The bridge section puts the everyday version and the quantum version next to each other.",
    action: "Compare the two",
    setup: { scrollTo: "bridge" }
  },
  {
    title: "Controlled evolution",
    body:
      "Rather than watch one clock for a long time, the algorithm watches several at once. It brings in " +
      "a handful of spare qubits to do the watching — the control panel calls them ancillas, which is " +
      "just the technical word for a helper qubit. The first helper watches for one tick, the second " +
      "for two, the third for four, doubling all the way along. Every helper sees the same angle, but " +
      "at a different magnification.",
    observe:
      "Each helper ends up further round the dial than the one before, doubling every time. Same angle, bigger magnification.",
    action: "Show the helper qubits",
    setup: { systemIndex: 0, bits: 4, stageIndex: 2 }
  },
  {
    title: "Phase kickback",
    body:
      "This is the trick the whole thing turns on, and it is a little sneaky. The operation is meant to " +
      "act on the state you care about. But that state has one clean energy, so it comes back exactly " +
      "as it was, apart from the angle it picked up along the way. That angle has nowhere to go, so it " +
      "lands on the helper qubit that set the operation off instead. The answer ends up sitting on the " +
      "qubits you were going to look at anyway.",
    observe:
      "Watch this step. The state you care about holds still, and the helpers pick up the turning.",
    action: "Watch the kickback",
    setup: { systemIndex: 0, stageIndex: 2 }
  },
  {
    title: "The quantum Fourier transform",
    body:
      "The angle is now spread thinly across all the helpers, which is no use to anybody as it stands. " +
      "This step makes them interfere with one another, the way ripples do when they meet on water. " +
      "Almost everywhere they cancel each other out. In one place they add up. That place is your answer.",
    observe:
      "After this step the chart shows one tall bar with smaller ones either side. The tall bar is where everything added up.",
    action: "Make them interfere",
    setup: { systemIndex: 0, stageIndex: 3 }
  },
  {
    title: "The full QPE circuit",
    body:
      "That is the whole algorithm. Start with a state that has one clean energy. Bring in your helper " +
      "qubits. Let the angle land on them. Make them interfere so the answer stands out from everything " +
      "else. Look at the result. Five steps with a single purpose — turning an angle nobody can see " +
      "into a number anybody can read.",
    observe:
      "Step through all five with Next operation and watch the same state carried from one to the next.",
    action: "Start from the beginning",
    setup: { systemIndex: 0, stageIndex: 0 }
  },
  {
    title: "Precision and scale",
    body:
      "There is a catch. Your helpers can only give back so many possible answers — three of them give " +
      "you eight, four give you sixteen, and so on. So you never get the exact angle. You get the " +
      "nearest one they can express, like reading off a ruler that only has so many marks on it. More " +
      "helpers, more marks, closer answer. But there is a twist worth knowing: if the real angle sits " +
      "right between two marks, the answer gets less certain rather than more, because it cannot decide " +
      "between them.",
    observe:
      "With three helpers the answer comes back 0.375 nearly nine times out of ten. With four it is still 0.375 — but the true value now sits almost exactly between two marks, so you only get it about half the time.",
    action: "Read it with three helpers",
    setup: { systemIndex: 0, bits: 3, time: 3.2, stageIndex: 4 }
  }
];
