# Project Management Frontend Vue

Vue 3 frontend for the project management tool. The app talks to the Go backend through the Orval client generated from the backend OpenAPI contract.

## Current Scope

Implemented pages:

- Login: WeCom scan-shaped login and emergency admin login.
- Workspace dashboard.
- Project management list and project creation.
- Project detail tabs: overview, requirements, tasks, defects, sprints/phases, versions, tests, members, activity, configuration snapshot.
- Configuration center: project type tabs, workflows, roles.

The frontend does not run MSW or page-level business mocks. Business data, project templates, users, workflow states, and project detail tab data come from the backend.

## Environment

- Node.js 24 LTS
- pnpm 11

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

Default backend seed account:

- Email: `demo@example.com`
- Password: `demo1234`

The default dev server runs on `http://localhost:5174` and proxies `/api` to `http://localhost:8080`.

## Common Commands

```bash
pnpm api:generate
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

Generated files under `src/shared/api/generated` must not be edited by hand.
