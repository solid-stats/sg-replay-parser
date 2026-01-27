# Stats generator for Solid Games

![image](https://user-images.githubusercontent.com/46472464/170368201-75d53a23-cc63-4860-8692-2e888f443037.png)

[![codecov](https://codecov.io/gh/Afgan0r/sg-replay-parser/branch/master/graph/badge.svg?token=GP4996N1SK)](https://codecov.io/gh/Afgan0r/sg-replay-parser)

---

> **[21.04.2024] DEPRECATED:** This parser no longer maintaining. More info [here](https://sg.zone/topic/30?p=17#p163). Feel free to contact me if you need more information. Contacts can be found [below](#contacts)

---

## About

This app contains several jobs, that parses replays data from <https://sg.zone/replays>

## Architecture

- `src/shared` — shared consts, types, utils, and testing helpers
- `src/modules` — domain logic (`replays`, `parsing`, `statistics`, `output`, `yearStatistics`)
- `src/services` — orchestration over modules and IO
- `src/jobs` — executable entrypoints
- `src/db` — persistence layer

## Entrypoints

- `npm run pipeline:full` — full pipeline (discover → download → parse → stats → output)
- `npm run parse-new-year` — year statistics generation
- `npm run generate-replays-list` — fetch and cache replay list

## Contacts

- Discord: [link](https://discordapp.com/users/270491849066545153)
- Steam: [link](https://steamcommunity.com/id/Afgan0r)
- Telegram: [link](https://t.me/Afgan0r)

## License

This app is licensed under the GNU General Public License ([GPLv3](https://github.com/Afgan0r/sg-replay-parser/blob/master/LICENSE)).
