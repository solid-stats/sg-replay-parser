# Stats generator for Solid Games

![image](https://user-images.githubusercontent.com/46472464/170368201-75d53a23-cc63-4860-8692-2e888f443037.png)

[![codecov](https://codecov.io/gh/Afgan0r/sg-replay-parser/branch/master/graph/badge.svg?token=GP4996N1SK)](https://codecov.io/gh/Afgan0r/sg-replay-parser)

---

> **[21.04.2024] DEPRECATED:** This parser no longer maintaining. More info [here](https://sg.zone/topic/30?p=17#p163). Feel free to contact me if you need more information. Contacts can be found [below](#contacts)

---

## About

This app contains several jobs, that parses replays data from <https://sg.zone/replays>

## Local runs and Cloudflare rate limit

`sg.zone` is protected by Cloudflare and has strict polling/rate limits for non-whitelisted IPs.
Without proxying, replays list parsing can fail when running parser locally.

Use external relay service (for example `sg_stats_relay`) on a whitelisted server.

### Configure parser locally via `.env`

Copy sample env and set values:

```bash
REPLAYS_RELAY_URL=https://relay.your-domain/relay
REPLAYS_RELAY_TOKEN=<the-same-token-from-server>
```

Run parser

```bash
pnpm run generate-replays-list
```

## CD (GitHub Actions)

Workflow: `.github/workflows/ci.yml` (job `deploy`).

Trigger:

- `push` to `main` or `master`
- `workflow_dispatch` (manual run)

### GitHub Secrets

Create repository secrets:

- `CD_SSH_HOST` - server IP or host.
- `CD_SSH_PORT` - SSH port (usually `22`).
- `CD_SSH_USER` - deploy user on server.
- `CD_SSH_PRIVATE_KEY` - private SSH key for this deploy user.
- `CD_APP_DIR` - absolute path to this project on server.

Example for `CD_APP_DIR`:

```text
/home/deploy/sg-replay-parser
```

### One-time server setup

```bash
mkdir -p /home/deploy
cd /home/deploy
git clone git@github.com:<org>/<repo>.git sg-replay-parser
cd sg-replay-parser

cp .env.sample .env
# fill .env manually

pnpm install --frozen-lockfile
pnpm run build-dist
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
```

After that, each push to `main`/`master` runs remote script `deploy/remote-deploy.sh`:

- fetch + checkout target branch
- hard reset to `origin/<branch>`
- `pnpm install --frozen-lockfile`
- `pnpm run build-dist`
- `pm2 startOrReload ecosystem.config.cjs --update-env`

### Notes

- Keep production `.env` only on server (never commit it).
- Deploy user should have minimal rights for project directory and `pm2`.

## Contacts

- Discord: [link](https://discordapp.com/users/270491849066545153)
- Steam: [link](https://steamcommunity.com/id/Afgan0r)
- Telegram: [link](https://t.me/Afgan0r)

## License

This app is licensed under the GNU General Public License ([GPLv3](https://github.com/Afgan0r/sg-replay-parser/blob/master/LICENSE)).
