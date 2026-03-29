# External Integrations

**Analysis Date:** 2026-03-29

## APIs & External Services

**Replay Source:**
- `sg.zone` - source of replay listing pages, replay detail pages, raw replay JSON, and team roster pages.
  - SDK/Client: `node-fetch` through `src/0 - utils/request.ts`
  - Auth: none detected
  - Used by: `src/jobs/prepareReplaysList/utils/fetchReplaysPage.ts`, `src/jobs/prepareReplaysList/utils/fetchReplayPage.ts`, `src/jobs/prepareReplaysList/saveReplayFile.ts`, `src/jobs/generateMissionMakersList/utils/requestTeamPage.ts`

**Proxy / Relay:**
- Replay relay service - optional proxy used only for `https://sg.zone/*` requests to bypass rate limits or Cloudflare blocks.
  - SDK/Client: `node-fetch` through `src/0 - utils/getProxiedRequest.ts`
  - Auth: `REPLAYS_RELAY_URL`, `REPLAYS_RELAY_TOKEN`
  - Implementation: `src/0 - utils/request.ts` tries relay first, then falls back to direct fetch when applicable

**Spreadsheet Source:**
- Google Sheets CSV export - source of `nameChanges.csv`.
  - SDK/Client: `node-fetch` through `src/0 - utils/request.ts`
  - Auth: none detected
  - Used by: `src/jobs/updateNameChangesCsv/index.ts`

**Frontend CDNs in Generated HTML:**
- Tailwind CDN - stylesheet/script include in generated static HTML from `src/0 - utils/generateBasicHTML.ts`.
  - SDK/Client: browser-side `<script src="https://cdn.tailwindcss.com"></script>`
  - Auth: none
- cdnfonts.com - Bitter font include in generated static HTML from `src/0 - utils/generateBasicHTML.ts`.
  - SDK/Client: browser-side `<link href="https://fonts.cdnfonts.com/css/bitter" rel="stylesheet" />`
  - Auth: none

## Data Storage

**Databases:**
- Not detected.

**File Storage:**
- Local filesystem only.
  - Runtime root: `~/sg_stats` from `src/0 - utils/paths.ts`
  - Raw replays: `~/sg_stats/raw_replays`
  - Replay registry and HTML lists: `~/sg_stats/lists`
  - Final JSON and ZIP output: `~/sg_stats/results`
  - Temporary output staging: `~/sg_stats/temp_results`
  - Logs: `~/sg_stats/logs`
  - Yearly output: `~/sg_stats/year_results`

**Caching:**
- None detected as a separate service.
- Existing downloaded replay JSON files are reused from `~/sg_stats/raw_replays` in `src/jobs/prepareReplaysList/saveReplayFile.ts`.

## Authentication & Identity

**Auth Provider:**
- Custom token header for the optional replay relay.
  - Implementation: `src/0 - utils/getProxiedRequest.ts` sends `x-relay-token` for relay requests.

## Monitoring & Observability

**Error Tracking:**
- None detected as an external SaaS.

**Logs:**
- Local Pino log files under `~/sg_stats/logs` plus pretty console output, implemented in `src/0 - utils/logger.ts`.

## CI/CD & Deployment

**Hosting:**
- Self-managed Node.js host with PM2, defined by `ecosystem.config.cjs` and `deploy/remote-deploy.sh`.

**CI Pipeline:**
- GitHub Actions in `.github/workflows/ci.yml`.
  - Jobs: lint, typecheck, tests, deploy
  - Deploy transport: `appleboy/ssh-action`
  - Coverage upload: `codecov/codecov-action@v3`

## Environment Configuration

**Required env vars:**
- `REPLAYS_RELAY_URL` - optional relay base URL for local or protected runs, read in `src/0 - utils/getProxiedRequest.ts`
- `REPLAYS_RELAY_TOKEN` - required when relay URL is set, read in `src/0 - utils/getProxiedRequest.ts`
- `WORKER_COUNT` - optional worker-thread override, read in `src/0 - utils/runtimeConfig.ts`
- `LOG_LEVEL` - optional logger level override, read in `src/0 - utils/logger.ts`
- Deployment-only GitHub secrets are documented in `README.md` and consumed by `.github/workflows/ci.yml`: `CD_APP_DIR`, `CD_SSH_HOST`, `CD_SSH_PORT`, `CD_SSH_PRIVATE_KEY`, `CD_SSH_USER`

**Secrets location:**
- Local runtime env files at repo root: `.env` and `.env.sample`
- GitHub Actions repository secrets for deploy values, referenced by `.github/workflows/ci.yml`
- Runtime config JSON/CSV files are read from `~/sg_stats/config` via `src/0 - utils/paths.ts` and `src/jobs/prepareReplaysList/consts.ts`

## Webhooks & Callbacks

**Incoming:**
- None detected.

**Outgoing:**
- SSH deploy invocation from GitHub Actions to a remote host in `.github/workflows/ci.yml`.
- HTTP GET requests to `https://sg.zone/*`, relay endpoints, Google Sheets CSV export URL, Tailwind CDN, and cdnfonts.com from the files listed above.

---

*Integration audit: 2026-03-29*
