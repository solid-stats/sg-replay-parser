# Technology Stack

**Analysis Date:** 2026-03-29

## Languages

**Primary:**
- TypeScript 4.6.x - application code, jobs, worker pool, and tests under `src/**/*.ts`, compiled by `tsc` via `tsconfig.json` and `tsconfig.build.json`.

**Secondary:**
- JavaScript (CommonJS) - repo-level config and automation files such as `jest.config.js`, `babel.config.js`, `ecosystem.config.cjs`, and `deploy/remote-deploy.sh`.
- Shell - deployment automation in `deploy/remote-deploy.sh`.
- HTML/CSS strings - generated list pages assembled in `src/0 - utils/generateBasicHTML.ts`, `src/jobs/generateMaceListHTML/index.ts`, and `src/jobs/generateMissionMakersList/index.ts`.

## Runtime

**Environment:**
- Node.js 18.14.0 - pinned in `.nvmrc`.
- CommonJS output targeting ES6 - configured in `tsconfig.json` with `"module": "commonjs"` and `"target": "es6"`.

**Package Manager:**
- npm - scripts and lockfile are defined in `package.json` and `package-lock.json`.
- Lockfile: present (`package-lock.json`)

## Frameworks

**Core:**
- Node.js standard runtime - entrypoints in `src/start.ts`, `src/schedule.ts`, `src/jobs/prepareReplaysList/start.ts`, and `src/!yearStatistics/index.ts`.
- Worker Threads - multi-core replay parsing in `src/1 - replays/workers/workerPool.ts` and `src/1 - replays/workers/parseReplayWorker.ts`.
- Pino 8.x - structured logging in `src/0 - utils/logger.ts`.
- Zod 3.x - schema validation for worker data and CSV/name helpers in `src/1 - replays/workers/workerData.ts` and `src/0 - utils/namesHelper/prepareNamesList.ts`.

**Testing:**
- Jest 28.x with `ts-jest` - unit test runner configured in `jest.config.js`, executed against `src/!tests`.
- Babel Jest - Babel config exists in `babel.config.js` and supports the Jest toolchain declared in `package.json`.

**Build/Dev:**
- TypeScript compiler - `npm run tsc` and `npm run build-dist` from `package.json`.
- ESLint 8.x with Airbnb TypeScript config - configured in `.eslintrc`.
- PM2 - production process manager used by `npm run schedule-prod`, `ecosystem.config.cjs`, and `deploy/remote-deploy.sh`.
- Croner - cron scheduling library used in `src/schedule.ts`.

## Key Dependencies

**Critical:**
- `node-fetch` 2.x - all HTTP access goes through `src/0 - utils/request.ts` and `src/0 - utils/getProxiedRequest.ts`.
- `fs-extra` 11.x - filesystem operations across runtime data, logs, and outputs in `src/0 - utils/paths.ts`, `src/index.ts`, and many jobs.
- `lodash` 4.x - collection transforms and aggregation helpers across parsing/statistics layers such as `src/1 - replays/getReplays.ts` and `src/3 - statistics/global/index.ts`.
- `dayjs` 1.11.x - date parsing, UTC/timezone handling, and formatting via `src/0 - utils/dayjs.ts`.
- `pino` and `pino-pretty` - logging transport stack in `src/0 - utils/logger.ts`.

**Infrastructure:**
- `dotenv` - local relay env loading in `src/0 - utils/getProxiedRequest.ts`.
- `jsdom` - DOM parsing and HTML generation in `src/jobs/prepareReplaysList/utils/parseDOM.ts`, `src/jobs/generateMissionMakersList/index.ts`, and `src/jobs/generateMaceListHTML/index.ts`.
- `csv-parse` - CSV ingestion for name changes in `src/0 - utils/namesHelper/prepareNamesList.ts`.
- `archiver` - ZIP bundle generation in `src/4 - output/archiveFiles.ts`.
- `p-limit` - bounded replay-page parsing concurrency in `src/jobs/prepareReplaysList/parseReplaysOnPage.ts`.
- `uuid` - generated identifiers in `src/0 - utils/namesHelper/prepareNamesList.ts`.

## Configuration

**Environment:**
- Local env loading is limited to relay configuration in `src/0 - utils/getProxiedRequest.ts`.
- `.env` and `.env.sample` are present at repo root; `.env.sample` documents `REPLAYS_RELAY_URL` and `REPLAYS_RELAY_TOKEN`.
- Runtime worker parallelism is configured with `WORKER_COUNT` in `src/0 - utils/runtimeConfig.ts`.
- Log verbosity is configured with `LOG_LEVEL` in `src/0 - utils/logger.ts`.

**Build:**
- TypeScript build config: `tsconfig.json`, `tsconfig.build.json`.
- Lint config: `.eslintrc`, `.eslintignore`.
- Test config: `jest.config.js`, `babel.config.js`.
- Process/deploy config: `ecosystem.config.cjs`, `.github/workflows/ci.yml`, `deploy/remote-deploy.sh`.

## Platform Requirements

**Development:**
- Node.js 18.14.0 from `.nvmrc`.
- npm with dependency install from `package-lock.json`.
- Writable home-directory runtime data path `~/sg_stats`, used by `src/0 - utils/paths.ts`.
- Optional relay service for local replay scraping when Cloudflare blocks direct access, configured through `.env.sample` and consumed by `src/0 - utils/getProxiedRequest.ts`.

**Production:**
- Linux host with Node.js, npm, and PM2, matching the deployment flow in `deploy/remote-deploy.sh`.
- Git access and SSH-based deployment from `.github/workflows/ci.yml`.
- Persistent writable storage under `~/sg_stats` for raw replays, logs, config, and generated results as defined in `src/0 - utils/paths.ts`.

---

*Stack analysis: 2026-03-29*
