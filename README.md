# Stats generator for Solid Games

![image](https://user-images.githubusercontent.com/46472464/170368201-75d53a23-cc63-4860-8692-2e888f443037.png)

[![codecov](https://codecov.io/gh/Afgan0r/sg-replay-parser/branch/master/graph/badge.svg?token=GP4996N1SK)](https://codecov.io/gh/Afgan0r/sg-replay-parser)

---

> **[21.04.2024] DEPRECATED:** This parser no longer maintaining. More info [here](https://sg.zone/topic/30?p=17#p163). Feel free to contact me if you need more information. Contacts can be found [below](#contacts)

---

## About

This app contains several jobs, that parses replays data from <https://sg.zone/replays>

## Local development and Cloudflare rate limit

`sg.zone` is protected by Cloudflare and has strict polling/rate limits for non-whitelisted IPs.
Without proxying, replays list parsing can fail during local development.

Use external relay service (for example `sg_stats_relay`) on a whitelisted server.

### Configure parser locally via `.env`

Copy sample env and set values:

```bash
REPLAYS_RELAY_URL=https://relay.your-domain/relay
REPLAYS_RELAY_TOKEN=<the-same-token-from-server>
```

Run parser

```bash
npm run generate-replays-list-dev
```

## Contacts

- Discord: [link](https://discordapp.com/users/270491849066545153)
- Steam: [link](https://steamcommunity.com/id/Afgan0r)
- Telegram: [link](https://t.me/Afgan0r)

## License

This app is licensed under the GNU General Public License ([GPLv3](https://github.com/Afgan0r/sg-replay-parser/blob/master/LICENSE)).
