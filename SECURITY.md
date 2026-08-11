# Security Policy

## Supported versions

PhaseDial currently supports the latest code on the default branch and the most
recent tagged release. Older releases may not receive security fixes.

## Reporting a vulnerability

Please do not report suspected vulnerabilities in a public issue, pull request,
or discussion.

Use the repository's
[Private vulnerability reporting form](https://github.com/Byt-wyze-technology/PhaseDial/security/advisories/new).
If private reporting has not yet been enabled, contact the
[Byt-wyze Technology organization](https://github.com/Byt-wyze-technology)
privately and ask for a secure reporting channel without including exploit
details in the first message.

Include:

- the affected version or commit;
- the affected browser, runtime, or dependency;
- reproduction steps or a minimal proof of concept;
- likely impact;
- any suggested mitigation.

Maintainers will acknowledge a usable report when it is reviewed, investigate
it, and coordinate disclosure when a fix is available. Response times are
best-effort because this is a volunteer-maintained educational project.

## Scope

Security reports may cover source code, build configuration, dependencies, or
an official deployment. General quantum-computing questions, mathematical
corrections without a security impact, and vulnerabilities found only in
unofficial forks should use normal support or issue channels.

PhaseDial is a client-side teaching simulator. It currently has no accounts,
backend, database, secrets, payment flow, or quantum-hardware connection.

## Dependency audit policy

The committed dependency tree, including development dependencies, must have
no known high- or critical-severity npm advisories. CI enforces this threshold:

```bash
npm run audit:dependencies
```

This check is separate from unit, build, and browser verification. A passing
test suite does not establish that dependencies are free from known advisories,
and a passing audit does not establish that application behavior is correct.
Lower-severity findings are reviewed during dependency maintenance but do not
currently block CI.
