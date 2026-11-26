# Security policy

Corporate Simulator 2026 is a fictional corporate management game. Security reports are treated seriously and separately from the satire.

## Supported versions

The maintained release baseline is recorded in [project status](docs/STATUS.md). Security fixes target the current maintained branch and verified hosted/portable builds. Historical commits and old offline downloads do not receive automatic updates.

## Reporting a vulnerability

Please do not publish exploit details, credentials, personal information, or unsanitised saves in public issues or pull requests. Once private vulnerability reporting is enabled, use the repository's Security tab, **Report a vulnerability**. The owner must enable and verify that channel before public-source publication; it is not confirmed available yet. Until then, use an existing private contact with the repository owner, if available, and do not post sensitive details publicly.

Include the affected version or commit, environment, a concise description, reproducible steps, impact and minimal sanitised evidence. Do not access other people's accounts, data or infrastructure or disrupt hosted services. Coordinate disclosure with the maintainer. No bounty or guaranteed response deadline is offered.

## Scope and boundaries

The game runs locally in a browser, with no application backend, central player database, account system or external model inference. The hosted site still uses an external hosting provider and ordinary HTTP requests; do not assume network anonymity. Browser saves are local, not encrypted by the game, and separate from manual exports. Do not treat fictional employment or achievement records as real credentials. Download software only from trusted sources and avoid exposing development servers to untrusted networks.

The [security assurance record](docs/SECURITY_ASSURANCE.md) documents verified controls and outstanding work. Dependency scans, security headers and regression tests reduce risk but are not guarantees that every vulnerability is absent.
