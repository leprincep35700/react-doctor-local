# React Doctor Local

Privacy-first React diagnostics for teams that cannot send codebase findings to third-party services.

React Doctor Local is a local-only fork of `millionco/react-doctor`, maintained as an open-source project with a privacy-first posture by Veonum.com.

## Privacy guarantees

- No telemetry.
- No remote scoring.
- No share links.
- No API endpoint for score calculation.
- No network calls during scans.
- Scores are calculated locally from local diagnostics only.

## Usage

Run directly from the public GitHub repository:

```bash
npx -y github:leprincep35700/react-doctor-local .
```

Compatibility alias, if installed from this package:

```bash
react-doctor .
```

The package is not published to npm yet. The GitHub `npx` command above is the supported public install path for now.

The `--offline` flag is kept as a compatibility no-op: every scan is already local-only.

## What it checks

It keeps the React diagnostics from the upstream project: state and effects, performance, architecture, security, accessibility, dead code, React Native, Next.js, TanStack, and related React anti-patterns.

## Agent skill install

```bash
npx -y react-doctor-local@latest install --dry-run
```

Review what will be written before installing agent instructions.

## License

MIT. This repository includes substantial code from `millionco/react-doctor`; the original copyright and MIT license notice are preserved in `LICENSE`.

Original project copyright: Copyright (c) 2026 Aiden Bai.
Local-only fork maintained by Veonum.com.
