# Security Policy

## Supported versions

PhaseDial currently supports the latest code on the default branch and the most
recent tagged release. Older releases may not receive security fixes.

## Reporting a vulnerability

Please do not report suspected vulnerabilities in a public issue, pull request,
or discussion.

Use GitHub's **Private vulnerability reporting** feature on the repository's
Security tab when it is available. If private reporting has not yet been
enabled, contact a maintainer privately through their GitHub profile and ask
for a secure reporting channel without including exploit details in the first
message.

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
