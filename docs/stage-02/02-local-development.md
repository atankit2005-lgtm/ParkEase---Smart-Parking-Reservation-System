# Stage 02 — Local Development Guide

This guide documents the Stage 02 infrastructure: the npm-workspaces monorepo, the
toolchain, local MongoDB replica set, test commands, and CI. It records the delegated
Stage 02 toolchain decisions (OD-02B, OD-02C, OD-02D); it creates no new ADR.

## Prerequisites

- Node.js **24.21.0** (see `.nvmrc`; use a version manager or install the exact version)
- npm **11.19.0** (declared in root `package.json` `packageManager`; CI installs this
  exact version. The broader `engines` range does not enforce the exact local version.)
- Docker Desktop with the `docker compose` plugin (required only for the MongoDB
  replica set and the database/transaction tests)
- Windows, macOS, or Linux. On Windows, `core.autocrlf=true` is safe:
  `.gitattributes` (`* text=auto eol=lf`) makes line endings deterministic for
  format and lint checks.

## Repository layout

```
apps/api            Express 5 API shell (TypeScript, NodeNext)
apps/web            React 19 + Vite web shell (TypeScript)
packages/contracts  Shared zod schemas (client+server safe)
packages/config     Shared tsconfig bases (strict)
e2e/                Playwright browser tests (scaffold)
scripts/            mongo-replica-set.mjs (local infra control)
docker-compose.yml  Single-node MongoDB replica set (rs0)
.github/workflows/  CI (quality / mongodb-transactions / e2e jobs)
```

`@parkease/contracts` is consumed as TypeScript source through workspace links
(`exports` points at `src/index.ts`). This keeps typecheck/tests runnable on a fresh
clone without a build-order requirement. Packaging compiled output is a later-stage
concern.

## Setup

```bash
npm ci
```

For local API and database-test settings, copy `.env.example` to `.env`. The API
shell and its Vitest configuration load that root file using Node's built-in
environment-file support; variables already set in the shell or CI take precedence.
The Docker Compose service and replica-set management script use their checked-in
local defaults and do not read `.env`.

```powershell
Copy-Item .env.example .env
```

On macOS or Linux, use `cp .env.example .env`.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start all workspace dev servers (API: tsx watch; web: Vite on 5173) |
| `npm run build` | Build every workspace (api: tsc emit; web: tsc noEmit + vite build) |
| `npm run typecheck` | `tsc --noEmit` for every workspace plus the e2e project |
| `npm run lint` | ESLint (flat config) across the repo |
| `npm run format` / `format:check` | Prettier write / check (scoped by `.prettierignore`) |
| `npm run test` | All workspace tests (requires the replica set for api db tests) |
| `npm run test:unit` | Unit tests (contracts schemas, web components) |
| `npm run test:integration` | API tests (supertest, in-process) |
| `npm run test:db` | Database/transaction tests (requires replica set) |
| `npm run test:e2e` | Playwright Chromium tests (starts the web dev server itself) |
| `npm run infra:start` | Start MongoDB replica set `rs0`, initiate idempotently, wait for primary |
| `npm run infra:stop` | Stop the replica set (data volume is kept) |
| `npm run infra:status` | Show container and replica set status |

## MongoDB replica set (local)

`docker-compose.yml` runs `mongo:8` as a single-node replica set `rs0` with the data
volume `mongo-data` (git-ignored). `scripts/mongo-replica-set.mjs` wraps
`docker compose`:

- `start`: `up -d --wait`, then an idempotent `rs.initiate` (already-initialized sets
  are left untouched), then polls `rs.status().myState` until a primary is elected.
- The transaction tests connect with
  `mongodb://127.0.0.1:27017/?directConnection=true&replicaSet=rs0`
  (`MONGO_URL` in `.env.example`).

Transactions require a replica set per ADR-003; a standalone `mongod` cannot satisfy
the database/transaction test category.

## CI

`.github/workflows/ci.yml` runs on pushes to `stage/**` and pull requests to `main`
or `stage/**`:

1. **quality** — `npm ci` → `format:check` → `lint` → `typecheck` → unit tests →
   integration tests → build all workspaces.
2. **mongodb-transactions** — start the pinned MongoDB image through Docker Compose →
   initiate `rs0` → wait for primary → run the transaction tests.
3. **e2e** — install Playwright Chromium (`--with-deps`) → `npm run test:e2e`.

CI uses the exact Node version from `.nvmrc` and never uses production secrets.

## Toolchain decisions recorded (delegated by the Stage 02 plan)

- **OD-02C — package manager:** npm workspaces, `npm@11.19.0` declared in the root
  `packageManager` field and explicitly installed by each CI job; lockfile version 3.
- **OD-02B — browser E2E tool:** Playwright **1.63.0** (Chromium project; scaffold
  runs one shell rendering test).
- **OD-02D — exact versions:** TypeScript **6.0.3** (not 7.0.2 — `typescript-eslint@8.71.0`
  requires `typescript >=4.8.4 <6.1.0`; ESLint 10.12.0, Prettier 3.9.9, Vitest 5.0.3,
  Express 5.2.1, React 19.3.0, Vite 8.3.2, mongodb driver 7.7.0, zod 4.6.5). All pins
  are exact in every `package.json`.
- **TS module system:** NodeNext for Node-side packages (`apps/api`, `packages/contracts`,
  e2e), ESNext/Bundler for `apps/web`. All bases extend one strict base config
  (`strict` plus `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`) per ADR-001.

## Scope notes

- The API exposes only `GET /health` (validated against `@parkease/contracts`).
  Versioned routing, config validation, error envelopes, logging, security headers,
  CORS, and rate limiting belong to Stage 04 per the architecture docs.
- No environment file beyond `.env.example` is committed; no secrets exist in this
  repository.
