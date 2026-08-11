# Testing Plan

Implementation status: complete and verified locally and in GitHub Actions.

This plan defines the next verification increment for PhaseDial. It covers the
implemented analytical QPE engine and one high-value browser workflow. It does
not introduce a full component-test suite, visual regression, accessibility
automation, or cross-browser coverage.

## Objectives

1. Verify the numerical invariants declared in the mathematical model across
   the complete UI ancilla range.
2. Protect the circular phase-boundary correction with an end-to-end browser
   regression test.
3. Keep every test deterministic and reproducible in local development and CI.
4. Make unit and browser verification available through documented npm scripts.

## Authoritative inputs

- `src/engine.ts` for the implemented numerical behavior.
- `src/App.tsx` for the interactive workflow and rendered readout.
- `docs/MATHEMATICAL_MODEL.md` for declared domains and invariants.
- `src/engine.test.ts` for the existing unit-test conventions.
- `.github/workflows/ci.yml` for automated verification.

## Work package 1: numerical property coverage

Status: complete.

Expand `src/engine.test.ts` with deterministic, parameterized cases. Use the UI
ancilla domain `bits in {2, ..., 8}` and a fixed phase corpus containing:

- zero;
- values close to zero and one;
- negative and greater-than-one inputs that require wrapping;
- exactly representable register phases;
- non-grid phases;
- half-cell boundary cases where rounding behavior matters.

### Distribution invariants

For every selected phase and ancilla count, verify:

- the distribution contains exactly `2 ** bits` entries;
- outcomes cover the integer interval `[0, 2 ** bits - 1]` in order;
- every bitstring has exactly `bits` characters and represents its outcome;
- every probability is finite and lies within `[0, 1]`, allowing only an
  explicitly documented floating-point tolerance;
- the total probability is one within a fixed tolerance.

### Exact-grid behavior

For representative grid indices at several register sizes, verify:

- the matching outcome has probability one;
- all other outcomes have probability zero within tolerance;
- `nearestEstimate` returns the same outcome, phase, and padded bitstring.

Include the zero outcome and the final register cell so both ends of the
periodic register are covered.

### Estimate and circular-distance behavior

Verify:

- the nearest estimate stays within half a register cell under
  `phaseDistance`;
- estimates that round beyond the final cell wrap to outcome zero;
- `phaseDistance(a, b) === phaseDistance(b, a)` within tolerance;
- phase distance is always within `[0, 0.5]`;
- equivalent wrapped phases have zero distance.

### Deterministic sampling

Verify:

- identical phase, bit count, and seed inputs return the same outcome;
- sampled outcomes always belong to the declared distribution;
- a fixed sequence of interaction seeds is reproducible.

The tests must not use `Math.random()`, current time, or environment-dependent
values.

## Work package 2: browser boundary regression

Status: complete.

Add a Playwright test configuration and one Chromium test. Reuse the installed
`playwright` dependency rather than adding a second browser framework.

The test must:

1. start the Vite preview server through Playwright configuration;
2. load the application with reduced motion enabled;
3. select a deterministic system, ancilla count, and evolution time that place
   the phase near the zero-one boundary;
4. verify that the nearest estimate wraps to zero;
5. verify that `PHASE ERROR` displays the small circular distance rather than a
   value close to one;
6. advance to the measurement stage and verify that `Measure again` renders a
   valid bitstring of the configured length.

Prefer accessible roles and labels for selectors. Add a stable test identifier
only if the existing accessible UI cannot identify a value reliably.

## Work package 3: commands and CI

Status: complete.

Add npm scripts with separate responsibilities:

- `test` continues to run Vitest unit tests;
- `test:browser` runs the Playwright regression test;
- `check` runs unit tests, the production build, and browser tests in a clear
  order.

Update `.github/workflows/ci.yml` to install the required Chromium browser and
run the browser suite after the production build. Preserve the existing
least-privilege permissions, concurrency cancellation, and timeout.

## Work package 4: documentation

Status: complete.

After implementation, update only claims affected by the new coverage:

- `README.md`: verification commands and test-suite description;
- `docs/ARCHITECTURE.md`: browser-test location and CI flow;
- `docs/MATHEMATICAL_MODEL.md`: invariants covered by automated tests;
- `docs/ROADMAP.md`: remove completed testing items and retain future scope;
- `CHANGELOG.md`: summarize the added numerical and browser regressions.

## Verification sequence

Status: complete. All commands passed on 2026-08-11.

Install the local Chromium binary once with `npx playwright install chromium`,
then run, in order:

1. `npm test`
2. `npm run build`
3. `npm run test:browser`
4. `npm run check`
5. `git diff --check`

Review the final diff to ensure generated screenshots, build output, test
reports, and browser traces are not accidentally committed.

## Completion criteria

Current assessment:

- [x] All declared engine invariants above have deterministic automated
  coverage. Evidence: `npm test` passes 35 tests in `src/engine.test.ts` across
  ancilla counts two through eight.
- [x] The zero-one boundary is verified through the rendered UI. Evidence:
  `tests/phase-boundary.pw.ts` passes in Chromium against the production
  preview and checks phase `0.99`, estimate `0.00`, and error `0.01`.
- [x] All verification commands pass locally. Evidence: `npm test`, `npm run
  build`, `npm run test:browser`, `npm run check`, and `git diff --check` passed
  on 2026-08-11.
- [x] CI runs both unit and browser tests. Evidence: GitHub Actions run
  `31505389010` completed successfully for commit `c64e8e8`.
- [x] Documentation matches the implemented commands and coverage. Evidence:
  the README, architecture, mathematical model, roadmap, and changelog were
  checked against `package.json`, the tests, and the CI workflow.
- [x] No unrelated dependencies or product behavior have changed. Evidence:
  `package.json` changes only npm scripts, `package-lock.json` is unchanged,
  and the implementation diff is limited to tests, test configuration, CI,
  ignored test artifacts, and documentation.

Overall verdict: complete. Every criterion is satisfied.

## Follow-up findings

This plan verifies the numerical behavior and browser boundary regression that
were in its declared scope. It does not establish that the scientific
energy-to-phase convention, dependency security, Node lifecycle, or GitHub
repository settings are settled. Those later findings are tracked in
[`REMEDIATION_PLAN.md`](REMEDIATION_PLAN.md), which is the active plan for that
work.
