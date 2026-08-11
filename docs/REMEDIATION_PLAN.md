# Scientific and Repository Remediation Plan

Status: active. Work packages 1 and 2 are complete. The local dependency fix in
work package 3 is verified; its Dependabot PR disposition remains pending.

This document is the authoritative ledger for issues discovered after the
numerical testing increment was completed. It replaces chat summaries as the
source of scope, sequencing, status, evidence, and completion decisions.

## Status vocabulary

- `pending`: accepted into scope but not started;
- `in progress`: currently being implemented or verified;
- `blocked`: cannot proceed without a recorded decision or external access;
- `complete`: implemented and verified against the stated acceptance criteria;
- `deferred`: recorded but deliberately excluded from this remediation cycle.

No work package may be marked complete merely because its code was written or
because a workflow is green. Its acceptance evidence must also be recorded.

## Authoritative inputs

- Runtime behavior: `src/engine.ts` and `src/App.tsx`.
- Automated evidence: `src/engine.test.ts`, `tests/phase-boundary.pw.ts`,
  `playwright.config.ts`, and `.github/workflows/ci.yml`.
- Scientific claims: `README.md`, `docs/MATHEMATICAL_MODEL.md`, and
  `docs/PRODUCT_VISION.md`.
- Dependency state: `package.json`, `package-lock.json`, `npm audit`, and the
  GitHub Advisory Database.
- Repository automation: `.nvmrc`, `.github/dependabot.yml`, GitHub Actions
  logs, and repository security settings.

## Current findings ledger

| ID | Finding | Severity | Status |
| --- | --- | --- | --- |
| SCI-1 | Forward evolution, energy-to-phase mapping, and QPE eigenphase use inconsistent signs. | High scientific correctness | complete: Decision A documented consistently |
| SCI-2 | The model does not explicitly declare `hbar = 1` or equivalent energy-frequency units. | Medium scientific clarity | complete: natural units declared |
| SCI-3 | Existing phase-conversion coverage uses a sign-blind half-turn example. | High assurance gap | complete: sign-sensitive engine and UI regressions pass |
| SEC-1 | `nanoid@3.3.16` is affected by `GHSA-2v37-7h3g-55p8`. | High advisory; low observed application exposure | complete locally: patched to 3.3.18 and audited |
| SEC-2 | CI reports the vulnerability but has no explicit audit policy or disposition step. | Medium assurance gap | complete locally: policy, command, and CI gate agree |
| SEC-3 | Dependabot vulnerability alerts/security updates are reported disabled while version updates are enabled. | Medium repository security | complete: owner enabled graph, alerts, and security updates |
| CI-1 | `actions/setup-node@v4` targets deprecated Node 20 and is forced onto Node 24. | High maintenance | local update verified; hosted CI pending |
| CI-2 | The project itself installs EOL Node 20 through `.nvmrc` and permits it in `package.json`. | High runtime maintenance | complete locally: Node 24 required and verified |
| DEP-1 | Three Dependabot PRs require refresh, review, testing, and explicit disposition. | Medium maintenance | dispositions selected; GitHub closure/verification pending |
| GOV-1 | `main` has no branch protection or ruleset. | Optional hardening | complete: owner created basic `main` ruleset |

## Work package 1: settle the scientific convention

Status: complete. Decision A selected and verified on 2026-08-11.

Decision record: preserve the current positive dial. PhaseDial defines the
displayed value as the QPE eigenphase of
$U_+(t)=e^{+iHt}=U_{\mathrm{fwd}}^\dagger(t)$, while standard forward evolution
remains $U_{\mathrm{fwd}}(t)=e^{-iHt}$. Natural units with $\hbar=1$ are
explicitly declared.

Before changing implementation or prose, record one convention as the product
contract.

### Decision A: preserve the current positive dial

Define

```text
phi_plus = Et / (2 pi) mod 1
U_plus(t) = exp(+iHt) = U_forward(t)^dagger
```

and explicitly distinguish it from standard forward Schrödinger evolution
`U_forward(t) = exp(-iHt)`. This preserves the current dial orientation,
default examples, probability output, and screenshots.

### Decision B: estimate the forward-evolution eigenphase

Define

```text
phi_forward = -Et / (2 pi) mod 1
U_forward(t) = exp(-iHt)
```

and update the engine, dial orientation, examples, distributions, screenshots,
and tests. The default positive `0.4` example becomes `0.6`.

### Required scientific audit

After the decision:

1. Declare whether `hbar = 1` or energy values represent angular frequency.
2. Check every time-evolution, controlled-unitary, phase-kickback, QFT, and
   Fourier-sign equation as one connected convention.
3. Check the default example and all three presets against that convention.
4. Distinguish physical forward evolution from any inverse or sign-selected
   teaching unitary.
5. Record calculated behavior separately from pedagogical illustrations.

### Acceptance criteria

- One sign convention is stated before it is used.
- `README.md`, `docs/MATHEMATICAL_MODEL.md`, UI equations, stage copy, and the
  bridge comparison agree algebraically.
- Units are dimensionally explicit.
- At least one independent reference convention is cited in the audit record.
- No equation silently changes the meaning of `phi`.

Verification evidence:

- the README, mathematical model, product vision, live equations, guided-stage
  copy, bridge comparison, and chart legend identify the displayed value as
  the eigenphase of `U_plus`;
- standard forward evolution remains explicitly `exp(-iHt)` and natural units
  with `hbar = 1` are declared;
- the numerical mapping itself remains unchanged.

## Work package 2: add convention-sensitive tests

Status: complete. Verified locally on 2026-08-11.

1. Replace or supplement the half-turn energy conversion case with a
   sign-discriminating case such as magnitude `0.4`, whose opposite convention
   is `0.6`.
2. Add table-driven cases for zero, positive energy, negative energy, and phase
   wrapping under the selected convention.
3. Add a default-example regression that checks the documented energy, time,
   phase, estimate, and rendered value together.
4. Keep the existing distribution, circular-distance, sampling, and browser
   boundary tests unless the selected convention requires updated expectations.
5. Ensure expected values come from the recorded scientific contract rather
   than duplicating the implementation formula without justification.

### Acceptance criteria

- A deliberate sign reversal causes at least one test to fail.
- The default example is protected in both engine and rendered-UI coverage.
- Tests state which convention they enforce.
- Existing numerical invariants continue to pass.

Verification evidence:

- 40 unit tests pass, including table-driven zero, positive, negative, and
  wrapping cases plus the documented default phase and four-bit estimate;
- 2 Chromium tests pass, including the rendered default value and positive
  convention label;
- the production build passes;
- refreshed screenshots were inspected for the changed convention text.

## Work package 3: resolve the dependency advisory

Status: local lockfile update and verification complete. The grouped Dependabot
PR still requires an explicit disposition.

Current evidence:

```text
vite@8.1.5 -> postcss@8.5.23 -> nanoid@3.3.18
```

The advisory affects Nano ID versions below `3.3.17`. The retained minimal
lockfile update moves the transitive development dependency to 3.3.18 without
changing any direct dependency.

Implementation sequence:

1. Decide between a minimal transitive lockfile update and the broader grouped
   development-dependency PR.
2. Update Nano ID to a patched compatible version.
3. Review the complete lockfile diff; do not accept unrelated dependency
   changes without recording them.
4. Run the complete verification suite.
5. Run both full and production-only audits and record the results.

### Acceptance criteria

- `npm audit` reports no known high or critical vulnerabilities, or an explicit
  time-bounded exception is documented with package path and exposure analysis.
- `npm audit --omit=dev` remains clean.
- Unit, build, and browser verification pass with the updated lockfile.
- The grouped Dependabot PR receives an explicit merge, replace, or close
  disposition.

Local verification evidence from 2026-08-11:

- `npm ci` installs Nano ID 3.3.18 from the lockfile;
- 40 unit tests, the production build, and 2 Chromium tests pass;
- both `npm audit` and `npm audit --omit=dev` report zero vulnerabilities;
- the only dependency diff is Nano ID 3.3.16 to 3.3.18.

Outstanding external action: record the grouped Dependabot PR disposition.

Recorded PR dispositions:

- PR #1 (`actions/checkout@v7`): replace with the reviewed local workflow
  update; close after the final change is published;
- PR #2 (`actions/setup-node@v7`): replace with the reviewed local workflow
  update; close after the final change is published;
- PR #3 (grouped development dependencies): do not merge into this remediation
  change; close and allow a fresh dependency update after remediation closure.

## Work package 4: modernize Node and GitHub Actions

Status: local Node 24 verification complete. Hosted CI log inspection and
action-PR dispositions remain pending.

1. Select a supported Node LTS line, with Node 24 as the initial candidate.
2. Update `.nvmrc`, `package.json` engines, and every setup document together.
3. Refresh and review the `actions/setup-node` update, including its release
   notes and caching behavior.
4. Refresh and review the `actions/checkout` update separately.
5. Run the complete suite on the selected Node version locally and in CI.
6. Inspect the resulting full CI log, not only its conclusion.

### Acceptance criteria

- Local setup and CI use a supported Node release.
- The CI log contains no forced Node-runtime compatibility warning.
- Action deprecation warnings attributable to the old versions are gone.
- Checkout, npm cache, unit tests, build, and browser test all pass.
- Action PRs receive an explicit merge, replace, or close disposition.

Local verification evidence from 2026-08-11:

- `.nvmrc`, package engines, README, and contributing guidance select Node 24;
- CI uses `actions/checkout@v7` and `actions/setup-node@v7`;
- a clean install and `npm run check` pass under Node 24.19.0;
- 40 unit tests, the production build, and 2 Chromium tests pass;
- hosted CI log inspection and PR dispositions remain outstanding.

## Work package 5: define dependency-security policy

Status: complete locally. Hosted CI confirmation is part of final verification.

1. Decide whether full `npm audit` is a blocking CI gate, a reporting step, or
   a scheduled/manual review.
2. If it becomes a gate, define the severity threshold and treatment of
   development dependencies explicitly.
3. Avoid claiming that a green test/build workflow means a clean dependency
   tree unless the workflow actually verifies that claim.
4. Document the chosen policy in `SECURITY.md`, `CONTRIBUTING.md`, and CI where
   applicable.

### Acceptance criteria

- The policy distinguishes test/build success from dependency assurance.
- Developers have one documented command for reproducing the check.
- CI behavior matches the written policy without silently ignoring findings.

Decision and evidence:

- `npm run audit:dependencies` runs the full dependency audit, including
  development dependencies, and blocks on high or critical advisories;
- lower-severity advisories remain non-blocking maintenance findings;
- `npm run check`, CI, `SECURITY.md`, `CONTRIBUTING.md`, and
  `docs/ARCHITECTURE.md` use the same policy;
- the Node 24 local quality gate passes with zero known vulnerabilities.

## Work package 6: review GitHub security settings

Status: complete. Repository-owner changes were confirmed on 2026-08-11. The
connected GitHub integration remains read-only for this repository (`pull:
true`, `push/admin: false`).

1. Verify the authenticated repository state for dependency graph, Dependabot
   alerts, and Dependabot security updates.
2. Decide whether to enable alerts and security updates.
3. Verify that scheduled version-update YAML remains valid after the decision.
4. Decide whether to protect `main` against force pushes/deletion and whether
   to require the CI status check.
5. Record any workflow impact, especially whether direct pushes remain allowed.

### Acceptance criteria

- Each setting has an explicit enabled/disabled decision and rationale.
- The authenticated GitHub view confirms the intended configuration.
- Branch protection, if enabled, names the correct CI check and does not create
  an undocumented contribution workflow.

Authenticated evidence from 2026-08-11:

- the repository is public and its default branch is `main`;
- this session cannot read or change administrative security settings;
- repository-owner screenshots confirm that dependency graph, Dependabot
  alerts, and Dependabot security updates are enabled;
- Dependabot PRs #1, #2, and #3 are present and their intended dispositions are
  recorded above;
- the repository owner confirmed creation of the basic `main` ruleset after
  enabling dependency graph, alerts, and security updates.

## Work package 7: reconcile documentation and evidence

Status: complete locally. Final hosted evidence remains in work package 8.

Update all affected sources as one operation:

- `README.md` for the learner-facing convention and setup requirements;
- `docs/MATHEMATICAL_MODEL.md` for equations, units, domains, and limits;
- `docs/PRODUCT_VISION.md` for the exact learning claim;
- `docs/ARCHITECTURE.md` for runtime and verification flow;
- `CONTRIBUTING.md` and `SECURITY.md` for dependency policy;
- `docs/ROADMAP.md` to remove completed work and retain deferred scope;
- `CHANGELOG.md` for implemented corrections;
- screenshots only if visible values or wording change.

### Acceptance criteria

- A repository-wide search finds no superseded signs, Node versions, action
  versions, audit commands, or security claims.
- Every important claim maps to implementation, tests, CI evidence, or an
  explicitly marked limitation.
- Documentation does not describe configuration that was merely proposed.

Reconciliation evidence from 2026-08-11:

- README, contributing, security, architecture, mathematical model, product
  vision, testing plan, roadmap, and changelog were checked against the active
  source, scripts, lockfile, and workflow;
- stale Node, Actions, convention, and verification-command searches return
  only historical finding descriptions in this plan;
- the README now describes the dependency audit performed by `npm run check`;
- the roadmap retains only deferred future scope; no completed remediation item
  required removal.

## Work package 8: final verification and closure

Status: local verification complete. Hosted CI and PR cleanup remain pending.

Run and record:

1. clean dependency installation from the lockfile;
2. unit tests;
3. production build;
4. Chromium browser test;
5. full local check;
6. full and production-only dependency audits;
7. documentation consistency searches;
8. diff and generated-artifact review;
9. hosted CI result and warning inspection for the exact final commit;
10. authenticated confirmation of any GitHub settings changed.

### Completion criteria

This remediation cycle is complete only when:

- [x] the scientific convention and units are explicit and consistent;
- [x] convention-sensitive engine and UI tests pass;
- [x] the high-severity dependency advisory is fixed or formally dispositioned;
- [x] the project uses a supported Node release;
- [ ] GitHub Actions no longer emits the identified Node-runtime warning;
- [x] dependency-audit behavior is explicit and reproducible;
- [x] Dependabot and branch-protection decisions are recorded and verified;
- [x] all affected documentation is synchronized;
- [ ] local verification and hosted CI pass without unreviewed warnings;
- [ ] every open Dependabot PR has a recorded disposition.

No overall `complete` verdict may be recorded while any required checkbox is
open.

Local verification evidence from 2026-08-11:

- clean installation succeeded under Node 24.19.0 with Nano ID 3.3.18;
- `npm run check` passed: zero high/critical audit findings, 40 unit tests,
  production build, and 2 Chromium tests;
- `npm audit --omit=dev` reported zero production vulnerabilities;
- documentation consistency searches and `git diff --check` passed;
- the complete working-tree diff and changed screenshots were reviewed;
- hosted CI inspection and the recorded PR closures remain outstanding.

## Captured but deferred scope

These items remain visible but are not silently included in this remediation
cycle:

- component tests;
- keyboard and responsive browser coverage;
- automated accessibility checks;
- Firefox and WebKit coverage;
- visual-regression automation;
- complete state-vector or Hamiltonian simulation;
- eigenstate-superposition inputs;
- self-hosting the external fonts;
- release automation and tagged releases.

Their long-term home remains `docs/ROADMAP.md`. Moving any deferred item into
active scope requires adding acceptance criteria and updating this ledger.
