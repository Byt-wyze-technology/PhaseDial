# Measurement Sampling Remediation Plan

Status: ready for owner review. No implementation has started.

This plan replaces PhaseDial's measurement sampler, which does not draw from the
distribution it displays. Every numerical claim below was measured before the
plan was written; the reproduction commands are given in the verification
section so any reviewer can re-derive them.

## 1. Defect statement

`seededMeasure` in `src/engine.ts` selects a measurement outcome by inverse-CDF
lookup, driven by this cursor:

```js
let cursor = ((Math.sin(seed * 999) + 1) / 2) * total;
```

`Math.sin(seed * 999)` is not a pseudo-random generator. It is a smooth
deterministic sweep, and it fails in two independent ways that compound.

### 1.1 Failure one: consecutive seeds are almost perfectly correlated

The UI advances the seed with `setMeasureSeed(v => v + 1)`, so the sampler's
correctness depends entirely on the behaviour of `sin(999n)` at consecutive
integers `n`.

```text
999 / 2π          = 158.99578814880346
distance to nearest integer = 0.004211851196544103
```

Because `999 / 2π` sits within 0.0042 of an integer, each seed increment
advances the sine argument by almost exactly a whole number of turns. The
residual advance is only **−0.00421185 turns per seed**, so the cursor requires
**237.4 consecutive seeds** to traverse the unit interval once.

Measured lag-1 serial correlation of the cursor over seeds 0…99,999:

| sampler | lag-1 correlation r |
| --- | --- |
| current `sin(seed * 999)` | **0.999650** |
| proposed replacement | −0.003915 |

A correlation of 0.9997 means each draw is essentially the previous draw. The
user-visible symptom is that "Measure again" appears not to work: at
`phase = 0.4`, `bits = 4`, seeds 1 through 12 all return outcome `6`.

### 1.2 Failure two: the cursor is arcsine-distributed, not uniform

Inverse-CDF sampling is only correct when the cursor is **uniform** on
`[0, total)`. If `θ` advances uniformly, then `(sin θ + 1) / 2` follows the
arcsine distribution `Beta(½, ½)`, with density

```text
f(x) = 1 / (π · √(x(1−x)))
```

This density is U-shaped: it diverges at both endpoints and is thinnest in the
middle. Measured over 2,000,000 seeds against the analytic arcsine CDF
`F(x) = (2/π)·arcsin(√x)`:

| bin | empirical | arcsine | uniform |
| --- | --- | --- | --- |
| [0.0, 0.1) | 0.20484 | 0.20483 | 0.10000 |
| [0.4, 0.5) | 0.06410 | 0.06409 | 0.10000 |
| [0.9, 1.0) | 0.20482 | 0.20483 | 0.10000 |

Maximum deviation from arcsine: `1.08e-5`. Maximum deviation from uniform:
`1.05e-1`. The cursor is arcsine-distributed to five decimal places.

The consequence follows directly. A cursor that concentrates near 0 and 1
over-selects the first and last outcomes of the register and under-selects the
peak. Measured at `phase = 0.4`, `bits = 4`, 5,000 seeds:

| outcome | analytic | sampled | error |
| --- | --- | --- | --- |
| 0 | 0.39% | 3.96% | 10.2× too likely |
| 6 (peak) | 57.40% | 41.44% | −15.96 points |
| 7 | 25.58% | 20.96% | −4.62 points |
| 15 | 0.36% | 3.80% | 10.6× too likely |

Both symptoms — the serial creep and the inflated tails — follow from the single
root cause that `sin` of a uniformly advancing angle is neither decorrelated nor
uniform.

### 1.3 Why the existing tests do not catch it

`src/engine.test.ts` asserts only that sampling is reproducible and that
outcomes fall inside the register. Both hold trivially for a broken sampler. No
existing assertion compares sampled frequencies against `distribution`, which
is the only property that would have failed.

### 1.4 Severity

PhaseDial's stated purpose is to show what measuring the QPE distribution looks
like. The chart is correct; the sampler beneath it is not. The defect sits
precisely on the project's central teaching claim, which is why this plan treats
it as blocking rather than cosmetic.

## 2. Fixed contract

- The public signature `seededMeasure(phase, bits, seed)` **does not change**.
  Verification (§5.1) confirms the replacement is well-distributed across
  consecutive integer seeds, which is the only pattern the UI uses.
- The returned shape `{ outcome, bits, probability }` does not change.
- No runtime dependency is added. The generator is written inline.
- `distribution`, `qpeProbability`, `nearestEstimate`, `phaseFromEnergy`,
  `phaseDistance`, and `clampPhase` are **not modified**.
- No UI file changes. `src/App.tsx` is untouched.
- Determinism is preserved: identical `(phase, bits, seed)` always yields an
  identical result, in perpetuity.
- The sampler remains explicitly non-cryptographic, and documentation must
  continue to say so.

## 3. Work packages

### Work package 1: replace the generator

Status: complete.

Modify exactly `src/engine.ts`.

Introduce `mulberry32`, a 32-bit generator with a period of 2³², chosen because
it is public domain, is roughly six lines, requires no dependency, and — unlike
a bare LCG — applies output mixing strong enough that the *first* draw from
consecutive integer seeds is well distributed. That last property is the one the
UI depends on and the one §5.1 tests.

```js
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

Replace the cursor construction in `seededMeasure` with a single draw from
`mulberry32(seed)`, scaled by the summed probability exactly as now.

Retain the existing normalisation by the measured `total` rather than assuming
1. §5.2 shows the analytic sum deviates from 1 by at most `2.665e-15`, so this
is defensive rather than necessary — but it costs nothing and keeps the sampler
correct if `distribution` ever changes.

Retain the final `values.at(-1)` fallback. It was reached 0 times in 70,000
trials across every ancilla count, but it remains the correct destination for
floating-point residue and must not be removed or converted to a throw — a
teaching UI must never crash mid-demonstration.

Acceptance criteria:

- the public signature and return shape are unchanged;
- no runtime dependency is added;
- identical inputs still produce identical outputs;
- no file other than `src/engine.ts` changes.

### Work package 2: add statistical tests

Status: complete.

Modify exactly `src/engine.test.ts`. Retain every existing assertion; these are
additions.

The tests use **fixed seed ranges**, so each statistic is a deterministic
constant. A test that either always passes or always fails cannot flake, which
is what makes a statistical assertion safe in CI.

**Test A — generator uniformity across consecutive seeds.** Take the first draw
from `mulberry32(s)` for `s` in `0…99,999`, bin into 20 equal bins, and assert
the chi-square statistic falls below the α = 0.001 critical value for 19 degrees
of freedom, **43.82**. Measured value: **13.71**.

**Test B — generator independence across consecutive seeds.** Assert the lag-1
Pearson correlation of that same sequence satisfies `|r| < 0.05`. Measured:
**−0.003915**. The current implementation scores **0.999650**, so this single
assertion is the direct regression guard for §1.1.

**Test C — goodness of fit against the analytic distribution.** For each
configuration below, draw one sample per seed for `s` in `0…19,999`, and compare
observed counts to `distribution(phase, bits)`. Pool every bin whose expected
count is below 5 into a single residual bin before computing the statistic; this
is the standard validity condition for chi-square and it is required here
because QPE tails fall far below that threshold.

| phase | bits | df after pooling | χ² measured | critical (α = 0.001) |
| --- | --- | --- | --- | --- |
| 0.4 | 4 | 15 | 12.83 | 37.697 |
| 0.317 | 5 | 21 | 18.12 | 46.797 |
| 0.99 | 6 | 45 | 51.37 | 82.720 |
| 0.123456 | 3 | 1 | 0.00 | 10.828 |

For contrast, the current sampler scores **18,486.68** on the first row and
**23,848.72** on the second — roughly 490× and 510× their critical values. The
test discriminates decisively.

Assert χ² < critical value for each row. Sample-size sensitivity was checked at
n = 5,000 / 10,000 / 20,000 / 50,000, giving χ² of 14.22 / 17.33 / 12.83 / 11.12
against the same 37.697 threshold, so the margin is not an artefact of the
chosen n.

**Test D — normalisation.** Tighten the existing `toBeCloseTo(1, 8)` to assert
`|Σp − 1| < 1e-12`. Justified by §5.2: the measured worst case across all
ancilla counts and eight representative phases is `2.665e-15`, three orders of
magnitude inside the proposed bound.

Acceptance criteria:

- Test C fails against the defective sampler and passes against the
  replacement;
- every pre-existing assertion still executes unchanged;
- the suite is deterministic across runs and platforms;
- suite runtime remains acceptable for CI.

Recorded outcomes, and two corrections to this plan as originally written:

- **Test C measured exactly as predicted.** Reverting only the cursor line
  produced χ² of 18486.68 (df 15), 23848.72 (df 21), 1237.14 (df 45), and
  14863.66 (df 1), against critical values 37.697 / 46.797 / 82.720 / 10.828.
  All four failed; all four pass after the fix. The first two figures match the
  pre-implementation predictions in this document to the decimal.
- **Tests A and B cannot fail against the defective code.** They assert
  properties of `mulberry32`, which did not exist before Work Package 1, so the
  original criterion "all four tests fail against the current implementation"
  was not achievable as stated. They are forward regression guards against
  substituting a weak generator, not reproductions of the original defect.
  Test C is the assertion that reproduces it.
- **Runtime is 3.13 s, not the estimated two.** The estimate predated the
  implementation. Test C dominates, because each of the 80,000 draws rebuilds
  `distribution` — inherent to exercising the real `seededMeasure` rather than a
  reimplementation. Sample sizes were left at the verified 20,000 rather than
  reduced to meet an estimate made before measurement.

`mulberry32` is exported so Tests A and B can address it directly. This adds one
name to the engine's surface; no existing signature changed.

### Work package 3: documentation

Status: complete. The `[1.0.0]` date must still be set to the actual release
day when the tag is re-cut.

Modify exactly `CHANGELOG.md` and `docs/MATHEMATICAL_MODEL.md`.

This work lands inside the initial release rather than after it (§6), so there
is no prior published behaviour to record a fix against.

- In `CHANGELOG.md`, do **not** add a `### Fixed` entry. Add a line to the
  existing `### Added` list under `[1.0.0]` stating that sampled measurement is
  drawn by inverse CDF from the analytic distribution and is verified against it
  by goodness-of-fit test.
- Set the `[1.0.0]` date to the day the release is actually cut.
- In `docs/MATHEMATICAL_MODEL.md`, state the sampling method (inverse CDF over
  the analytic distribution), the generator and its period, the determinism
  guarantee, and the explicit statement that it is not cryptographic.

Acceptance criteria:

- the changelog describes the shipped behaviour, not a defect history;
- the mathematical model documents how a displayed sample is produced;
- no other file changes.

## 4. Rejected test designs

Recorded so they are not proposed again.

**Rejected: asserting that consecutive seeds produce varied outcomes.** This
encodes a statistically false expectation. A correct sampler *must* repeat when
the distribution is concentrated. Measured peak probabilities and the mean run
lengths they imply:

| phase | bits | peak p | expected mean run |
| --- | --- | --- | --- |
| 0.4 | 4 | 0.5740 | 2.35 |
| 0.317 | 5 | 0.9337 | 15.08 |
| 0.123456 | 3 | 0.9995 | 2024.28 |

At `phase = 0.317, bits = 5` the **corrected** sampler produces a run of 62
identical outcomes within 500 seeds — and it should, since a run that long is
expected several times over at p = 0.9337. A "must vary" assertion would fail
correct code and could only be satisfied by re-breaking the sampler. Serial
correlation on the raw generator stream (Test B) is the statistically valid way
to catch the same defect.

**Rejected: a random-seed statistical test.** Any test drawing from an
unseeded source has a non-zero false-failure rate by construction. Fixed seeds
make the statistic a constant and remove flake entirely.

**Rejected: asserting per-outcome frequency within a fixed tolerance.** Workable
but weaker than chi-square, since it ignores degrees of freedom and needs an
arbitrary per-bin bound. Recorded for reference: the corrected sampler's worst
per-outcome absolute error is 0.00678 against the current sampler's 0.16042.

## 5. Verification protocol

Run under Node.js 24, in order:

1. `npm ci`
2. `npm test` — must fail on Tests A–D before Work Package 1, pass after
3. `npm run build`
4. `npm run test:browser`
5. `npm run audit:dependencies`
6. `npm run check`

Then confirm by hand in the running app that clicking **Measure again**
repeatedly at `phase = 0.4`, `bits = 4` visibly moves the outcome, and that the
sampled bar tracks the tallest bar over repeated presses.

### 5.1 Reference measurements

Every figure in this document was produced by direct computation against the
current `src/engine.ts` implementation. To re-derive them, evaluate:

- `999 / (2 * Math.PI)` and its distance to the nearest integer (§1.1);
- lag-1 Pearson correlation of `(Math.sin(s * 999) + 1) / 2` over `s = 0…99,999`
  (§1.1);
- a 10-bin histogram of that same sequence over 2,000,000 seeds compared with
  `(2/π)·arcsin(√x)` (§1.2);
- sampled outcome frequencies versus `distribution(0.4, 4)` (§1.2);
- chi-square goodness of fit for the four configurations in Test C.

### 5.2 Numerical basis for the tightened tolerance

`Σ P(m) = 1` holds exactly in exact arithmetic, by completeness of the Fourier
basis: the amplitude is `(1/N)·Σₖ e^{2πik(φ − m/N)}`, so summing `|·|²` over all
`m` returns the norm of a unit vector. In IEEE-754 the measured worst case over
ancilla counts 2–8 and phases `{0, 1e-6, 0.123456, 0.4, 0.5, 0.99, 1−1e-9,
0.317}` is `|Σp − 1| = 2.665e-15`, at `bits = 8, phase = 1−1e-9`.

### 5.3 Note on the epsilon guard

`qpeProbability` short-circuits to 1 when `|delta| < 1e-12`. This guard is
**necessary**, not cosmetic: at `delta = 0` both numerator and denominator are
zero and the expression evaluates to `NaN`, which would silently poison the
cursor. Values just outside the guard were checked (`delta = 1e-11` returns
exactly 1 through the general formula), so the branch introduces no
discontinuity. No change is required. Recorded because a future reader will
otherwise flag the magic number.

## 6. Release context

This work ships inside v1.0.0. The original v1.0.0 tag and release are being
withdrawn and re-cut once the sampler is correct, so no version of PhaseDial
will ever have been distributed with the defective sampler.

Consequences for this plan:

- there is no v1.0.1, and no compatibility note about changed seed-to-outcome
  pairings — there is no released prior behaviour to differ from;
- the changelog records the sampler as shipped behaviour, not as a fix (§3, Work
  Package 3);
- the verification protocol in §5 must pass before the release is re-cut, not
  after.

## 7. Non-goals

Deliberately excluded. Each is a real observation; none is part of this work.

- **Multi-shot sampling.** Drawing N shots from one stream and watching the
  histogram converge on the analytic curve would have genuine teaching value,
  but it needs a stream-based API and new UI. Separate proposal.
- **Decomposing `src/App.tsx`.** The 267-line single component is the
  repository's weakest structural point. Unrelated to sampling correctness.
- **UI test coverage.** Test weight is inverted — 158 lines of tests against a
  55-line engine, one browser regression against 267 lines of component.
- **Chart rendering above 6 bits.** `visibleDistribution` mixes strided sampling
  with near-estimate inclusion, producing uneven bar spacing. Cosmetic.

## 8. Completion checklist

- [x] Work Package 1 passes every acceptance criterion.
- [x] Test C demonstrated failing before the fix and passing after; Tests A, B,
      and D pass. See the Work Package 2 note on why A and B could not be shown
      failing against the defective code.
- [x] All pre-existing engine assertions still pass unchanged (46 tests).
- [ ] **`npm run check` passes under Node.js 24.** Passed, but under Node
      **v20.20.2** — the only runtime on the development shell, despite
      `.nvmrc` and `engines` both requiring 24. Unit, build, browser, and audit
      stages all succeeded. This must be re-run under Node 24 before the
      release is cut; CI already pins 24, so a green CI run discharges it.
- [x] Manual confirmation that "Measure again" visibly changes the outcome.
      At `phase = 0.4`, `bits = 4`, seeds 1–12 now yield
      `6 7 7 8 7 6 2 6 6 6 6 6` (4 distinct) against twelve consecutive `6`s
      before. Peak outcome samples at 58.07% versus 57.40% analytic, previously
      41.44%.
- [x] Changelog and mathematical model updated.
- [ ] `[1.0.0]` date set to the actual release day.
- [x] No file outside `src/engine.ts`, `src/engine.test.ts`, `CHANGELOG.md`,
      `docs/MATHEMATICAL_MODEL.md`, and this plan has changed.
- [ ] v1.0.0 re-cut only after the full verification protocol passes.
