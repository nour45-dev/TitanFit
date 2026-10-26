# Contributing to TitanFit (`CONTRIBUTING.md`)

## 1. Branching & Pull Request Policy
- **`main`**: Production branch (auto-deploys to Railway `production` after CI). Direct pushes are forbidden.
- **`develop`**: Staging branch (auto-deploys to Railway `staging` after CI).
- **`phase-N/*` / `feat/*` / `fix/*`**: Feature branches created from `develop` and merged via Pull Request after all CI checks pass.

## 2. Conventional Commits
All commit messages must follow Conventional Commits:
- `feat(<scope>): ...`
- `fix(<scope>): ...`
- `chore(<scope>): ...`
- `docs(<scope>): ...`
- `test(<scope>): ...`

## 3. Mandatory Pre-Commit & Pre-PR Quality Gates
Before opening or merging any PR, run:
```bash
node infra/scripts/secret-scan.mjs
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter @gymos/web test:e2e
```

## 4. RTL & Accessibility Rules
- Never use physical directional CSS classes (`ml-*`, `mr-*`, `pl-*`, `pr-*`, `left-*`, `right-*`). Always use logical CSS properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`).
- All interactive controls must maintain a minimum `44px` touch target (`min-h-[44px]`).
