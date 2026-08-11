# npm Package Implementation Plan

Status: ready for owner review. No implementation or publication has started.

This plan creates one npm package from PhaseDial's existing analytical engine.
It contains no open design choices for the implementer.

## Fixed contract

- Package: `@byt-wyze/phasedial`
- Initial version: `0.1.0`
- Licence: MIT
- Package type: ESM-only TypeScript library
- Runtime dependencies: none
- Supported runtime: Node.js 24 or later
- Published content: compiled engine, TypeScript declarations, package README,
  and MIT licence
- Root Vite application: remains `"private": true` and is never published
- Real npm publication: prohibited until separately authorized by the owner

The package exposes exactly these existing engine exports:

- `Stage`
- `stages`
- `clampPhase`
- `phaseDistance`
- `phaseFromEnergy`
- `nearestEstimate`
- `qpeProbability`
- `distribution`
- `seededMeasure`

No React component, CSS, screenshot, lesson copy, CLI, state-vector simulator,
or application bundle is included.

## Required prerequisite

Before implementation, verify that the owner controls the npm scope
`@byt-wyze` and that `@byt-wyze/phasedial` is available within it.

If either check fails, stop. Do not choose another name or account. Record the
failure in this document and return it to the owner for a decision.

## Work package 1: create the package workspace

Status: pending.

Create exactly:

```text
packages/phasedial/
  LICENSE
  README.md
  package.json
  tsconfig.json
  src/
    index.ts
    index.test.ts
```

Modify exactly:

```text
package.json
package-lock.json
src/App.tsx
vite.config.ts
tsconfig.app.json
```

Actions:

1. Add `packages/*` as the root npm workspace.
2. Move the engine implementation from `src/engine.ts` to
   `packages/phasedial/src/index.ts` without changing behavior.
3. Move the engine tests from `src/engine.test.ts` to
   `packages/phasedial/src/index.test.ts` without weakening assertions.
4. Update `src/App.tsx` to import the nine approved exports from
   `@byt-wyze/phasedial`.
5. Add TypeScript and Vite aliases that resolve that package name to the
   workspace source during application development and testing.
6. Remove the obsolete root `src/engine.ts` and `src/engine.test.ts` only after
   all imports and tests use the workspace source.
7. Copy the repository's existing MIT licence into the package unchanged.

Acceptance criteria:

- one engine implementation exists;
- the website consumes the package workspace rather than a duplicate;
- all existing engine assertions still execute;
- the root application remains private from npm publication;
- no file outside the list above changes.

## Work package 2: define the package manifest and build

Status: pending.

Create `packages/phasedial/package.json` with:

```json
{
  "name": "@byt-wyze/phasedial",
  "version": "0.1.0",
  "description": "Deterministic analytical utilities for teaching quantum phase estimation.",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "files": ["dist", "README.md", "LICENSE"],
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "engines": {
    "node": ">=24"
  },
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "test": "vitest run src/index.test.ts",
    "prepack": "npm run build"
  }
}
```

Also include the repository URL, issue URL, homepage, and existing relevant
keywords using the same values already recorded in the root manifest.

Create `packages/phasedial/tsconfig.json` to:

- target ES2022;
- emit ESM JavaScript to `dist`;
- emit `.d.ts` declarations to `dist`;
- use strict type checking;
- include only `src/index.ts` in the published build;
- exclude tests from emitted output.

Update root scripts so the package build runs before the application build and
the package tests run within the existing quality gate.

Acceptance criteria:

- `dist/index.js` and `dist/index.d.ts` are created;
- the declaration file contains all nine approved exports;
- the package has no runtime dependencies;
- internal files and tests are not exportable package subpaths.

## Work package 3: write package documentation

Status: pending.

Create `packages/phasedial/README.md` containing only:

1. installation with `npm install @byt-wyze/phasedial`;
2. one executable ESM import example;
3. the nine public exports with parameter and return descriptions;
4. valid input domains, including the application's ancilla range where
   applicable;
5. the positive `U_plus = exp(+iHt)` phase convention and `hbar = 1` units;
6. deterministic seeded measurement and the fact that it is not cryptographic;
7. numerical and educational limitations;
8. Node.js 24 requirement;
9. MIT licence notice and repository links.

Every code example must be executed against the packed package during Work
Package 4. Do not add untested examples.

## Work package 4: verify the package artifact

Status: pending.

Run under Node.js 24, in order:

1. `npm ci`
2. root unit tests
3. package unit tests
4. production application build
5. Chromium browser tests
6. full and production-only dependency audits
7. package build
8. `npm pack --dry-run --workspace @byt-wyze/phasedial`
9. `npm pack --workspace @byt-wyze/phasedial`

Then create an untracked temporary directory outside the repository and:

1. initialize a minimal npm consumer;
2. install the generated `.tgz` file;
3. run the documented JavaScript example;
4. type-check the documented TypeScript example;
5. import each of the nine public exports;
6. confirm an internal subpath import fails;
7. remove the temporary consumer and generated tarball.

Manually inspect the tarball before removal. Its file list must contain only:

```text
package/LICENSE
package/README.md
package/package.json
package/dist/index.js
package/dist/index.d.ts
```

Any additional file fails this work package.

## Work package 5: publication rehearsal

Status: pending.

With the owner's npm account authenticated to the official npm registry:

1. confirm the authenticated identity controls `@byt-wyze`;
2. confirm two-factor authentication is enabled;
3. rerun the complete verification sequence;
4. run `npm publish --dry-run --access public --workspace @byt-wyze/phasedial`;
5. record the dry-run name, version, registry, access, tag, file list, packed
   size, and integrity output in this document;
6. stop.

Do not run a real `npm publish` command. Do not create a Git tag or GitHub
release. Do not change the version.

## Completion checklist

- [ ] The owner controls `@byt-wyze` and the package name is available.
- [ ] Work Package 1 passes every acceptance criterion.
- [ ] Work Package 2 passes every acceptance criterion.
- [ ] Work Package 3 is complete and its examples execute.
- [ ] Existing unit, build, browser, and audit checks pass under Node 24.
- [ ] The packed package passes clean JavaScript and TypeScript consumer tests.
- [ ] The tarball contains exactly the five approved files.
- [ ] The authenticated publication dry run succeeds with public access.
- [ ] No credential, generated tarball, consumer project, or package build
      artifact is tracked by Git.
- [ ] The owner has reviewed the final diff and dry-run evidence.

## Hard stop

Completing this plan prepares the package but does not publish it.

A real publication requires a new owner instruction that explicitly states:

```text
Publish @byt-wyze/phasedial version 0.1.0 to npm with public access and the
latest tag.
```

Without that exact authorization, no real publication, Git tag, GitHub
release, commit, or push may occur.
