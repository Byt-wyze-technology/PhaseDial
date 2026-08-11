# Architecture

## Overview

PhaseDial is a client-side React application built with TypeScript and Vite.
There is no backend, database, authentication layer, runtime environment
variable, or persistence service.

```text
user controls
    ↓
React state in App.tsx
    ↓
pure functions in engine.ts
    ↓
derived phase, estimate, and distribution
    ↓
SVG/CSS visualizations and teaching copy
```

## Source layout

```text
src/
├── App.tsx          application state, interactions, and visual components
├── engine.ts       deterministic phase and QPE probability functions
├── engine.test.ts  mathematical engine tests
├── main.tsx        React DOM entry point
└── styles.css      layout, visual design, responsive rules, reduced motion

scripts/
└── capture-readme-screenshots.mjs
                    production-preview capture for README figures

tests/
└── phase-boundary.pw.ts
                    production-preview browser regression
```

## Engine boundary

`src/engine.ts` is independent of React. It exports:

- stage metadata;
- phase wrapping;
- circular phase-distance calculation;
- energy-to-phase conversion;
- nearest finite-bit estimation;
- ideal QPE outcome probability;
- complete output distribution construction;
- deterministic sampling from the distribution.

The engine is the authoritative source for displayed numerical results.

## Application state

`App.tsx` owns:

- selected system preset;
- ancilla count;
- evolution time;
- selected teaching stage;
- play/pause state;
- measurement interaction seed.

Derived numerical values are recalculated from this state. The app does not
store a hidden copy of the target phase or measurement distribution.

## Rendering

Visualizations are implemented with React, inline SVG, and CSS:

- the phase dial is SVG;
- measurement probabilities use proportional CSS bars;
- control-register arrows are pedagogical CSS transforms;
- responsiveness is handled by media queries;
- reduced motion is handled with `prefers-reduced-motion`.

Google Fonts are currently loaded from the public Google Fonts stylesheet at
runtime. A fully offline deployment would need to self-host or replace them.

## Build and verification

Vite serves the development app and produces static production assets.
TypeScript runs in strict mode. Vitest runs the engine tests, and Playwright
runs the circular phase-boundary workflow against the production preview.

```bash
npx playwright install chromium
npm run audit:dependencies
npm test
npm run test:browser
npm run check
```

The Playwright browser binary is installed separately from `npm ci`. `npm run
test:browser` builds the app before starting the preview. `npm run check` runs
the high-severity dependency gate, unit suite, production build, and browser
test. GitHub Actions applies the same audit threshold, installs Chromium, and
executes both test layers using the lockfile and Node version in `.nvmrc`.

README screenshots are reproducible browser artifacts. `npm run screenshots`
builds the app, starts Vite's production preview, captures three Chromium
views, and writes them to `images/`.

## Deployment characteristics

The contents of `dist/` are static assets and can be served by a static host.
Client-side routing is not used, so no route fallback configuration is needed.

There are no required runtime environment variables, storage mounts, health
endpoints, or secrets. A deployment should verify:

1. the root document loads;
2. bundled JavaScript and CSS return successfully;
3. controls update the dial and chart;
4. the external font request is allowed or a fallback font is acceptable.

## Trust and security boundary

The browser executes all simulation and rendering logic. The application does
not accept uploaded code, render user-provided HTML, or send learner state to a
project backend. Dependency and hosting compromise remain relevant risks.
