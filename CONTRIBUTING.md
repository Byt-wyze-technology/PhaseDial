# Contributing to PhaseDial

Thank you for helping make quantum phase estimation easier to learn.

PhaseDial welcomes bug fixes, accessibility improvements, clearer explanations,
new tests, and carefully scoped mathematical or interface enhancements. By
participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Before opening an issue

- Search [existing issues](https://github.com/Byt-wyze-technology/PhaseDial/issues)
  to avoid duplicates.
- Use [GitHub Discussions](https://github.com/Byt-wyze-technology/PhaseDial/discussions),
  when enabled, for open-ended questions and teaching ideas.
- Use an issue for a reproducible defect or a concrete proposed change.
- Report vulnerabilities according to [SECURITY.md](SECURITY.md), never in a
  public issue.

## Development setup

Requirements:

- Node.js 20.19 or later
- npm 10 or later

Install the exact dependency tree from the lockfile:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

Run the complete local quality gate:

```bash
npm run check
```

## Making a change

1. Fork [`Byt-wyze-technology/PhaseDial`](https://github.com/Byt-wyze-technology/PhaseDial)
   and create a focused branch from the default branch.
2. Keep the change small enough to review.
3. Add or update tests for mathematical behavior.
4. Update the README or files in `docs/` when behavior, setup, or limitations
   change.
5. Run `npm run check`.
6. [Open a pull request](https://github.com/Byt-wyze-technology/PhaseDial/compare)
   using the repository template.

Do not commit generated or machine-local content such as `node_modules/`,
`dist/`, coverage output, editor state, logs, or `.env` files.

## Mathematical contributions

Changes to `src/engine.ts` need evidence proportional to their impact.

- Declare the input and output domains.
- Preserve phase wrapping in \([0,1)\).
- Verify that probability distributions normalize to one within a stated
  floating-point tolerance.
- Handle singular or exact-grid cases explicitly.
- Keep finite-precision behavior visible to learners.
- Do not present an analytical shortcut as a full state-vector simulation.

The current implemented model is documented in
[`docs/MATHEMATICAL_MODEL.md`](docs/MATHEMATICAL_MODEL.md).

## Interface contributions

- Keep controls usable with a keyboard.
- Preserve visible focus states.
- Respect `prefers-reduced-motion`.
- Check narrow mobile and wide desktop layouts.
- Avoid color as the only carrier of meaning.
- Keep teaching text and displayed values driven by the same engine state.

## Tests

```bash
npm test
npm run build
```

The first command runs the Vitest engine suite. The second runs strict
TypeScript checks and produces the Vite build. Pull requests are expected to
pass both.

For a visible interface change, refresh the README figures:

```bash
npx playwright install chromium
npm run screenshots
```

Commit updated images only when the rendered interface actually changed.

## Documentation

Runtime code and tests are authoritative. If a narrative document conflicts
with the active implementation, update the document rather than expanding a
claim beyond the available evidence.

## Pull request expectations

A pull request should:

- explain the problem and the chosen solution;
- list the verification performed;
- identify user-visible and mathematical effects;
- update relevant documentation;
- avoid unrelated formatting or refactoring;
- contain no secrets or generated dependency directories.

Maintainers may request changes, split an oversized pull request, or decline
work that does not fit the project’s educational scope.

## License

By contributing, you agree that your contribution is licensed under the
[MIT License](LICENSE).
