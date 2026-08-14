# Changelog

All notable changes to PhaseDial will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project intends to use [Semantic Versioning](https://semver.org/) for
tagged releases.

## [Unreleased]

Nothing yet.

## [1.0.0] - 2026-08-14

First tagged release. PhaseDial was developed in the open before this point but
was never published under a version, so this entry consolidates the whole of
that work.

### Added

- Interactive energy-to-phase dial.
- Three pedagogical system presets.
- Adjustable evolution time and two-to-eight-bit ancilla precision.
- Five-stage quantum phase-estimation learning flow.
- Ideal finite-register QPE probability chart and sampled measurement readout.
- Deterministic inverse-CDF measurement sampling, verified against the
  analytical distribution by chi-square goodness-of-fit test.
- Ten guided lessons that configure the lab to demonstrate what each one
  describes, with every quoted figure produced by the engine.
- A live probability-normalization readout summed from the active
  distribution.
- Classical-frequency and quantum-phase-estimation comparison.
- Responsive interface and reduced-motion support.
- Mathematical engine tests for phase conversion, phase wrapping, finite
  precision, exact-grid behavior, probability normalization, and sampled
  outcome bounds.
- MIT license and open-source community-health files.
- Contribution, security, support, and governance guidance.
- GitHub issue forms, pull request template, CI, and Dependabot configuration.
- Maintainer-facing architecture and mathematical-model documentation.
- Reproducible browser screenshots for the overview, guided QPE lab, and
  measurement readout.
- A Playwright screenshot-capture command for keeping README figures current.
- Deterministic numerical property coverage across all supported ancilla sizes.
- A Chromium regression for circular phase error and measurement interaction.

### Changed

- Moved local setup and CI to Node.js 24 and updated the checkout and setup-node
  Actions to their Node 24-compatible major versions.
- Added a reproducible CI dependency gate for high- and critical-severity npm
  advisories, including development dependencies.
- Defined the positive phase dial as the QPE eigenphase of
  `U₊(t) = exp(+iHt)`, distinguished it from forward evolution
  `U_fwd(t) = exp(-iHt)`, and declared the `ℏ = 1` unit convention.
- Replaced the sign-blind half-turn conversion test with convention-sensitive
  positive- and negative-energy cases.
- Corrected displayed estimate error to use circular phase distance at the
  zero-one boundary.
- Replaced state-vector and exact-simulation UI claims with analytical
  ideal-QPE terminology matching the implemented model.
- Repository metadata and documentation aligned with the active implementation.
- Build-only packages classified as development dependencies.
- React, TypeScript, Vite, and Vitest updated to their current major releases.
- README rewritten as a plain-English, screenshot-led learning guide.
- CI and local checks extended to build the app and run the browser regression.

[unreleased]: https://github.com/Byt-wyze-technology/PhaseDial/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Byt-wyze-technology/PhaseDial/releases/tag/v1.0.0
