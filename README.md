# Stats generator for Solid Games

![image](https://user-images.githubusercontent.com/46472464/170368201-75d53a23-cc63-4860-8692-2e888f443037.png)

[![codecov](https://codecov.io/gh/Afgan0r/sg-replay-parser/branch/master/graph/badge.svg?token=GP4996N1SK)](https://codecov.io/gh/Afgan0r/sg-replay-parser)

## About

This app gets all replays from https://sg.zone/replays and then calculates the stats for each player and squad

## Example of data usage (not my website):

https://solid-stats.web.app/

## Output

This application outputs several JSON files:
1) Global statistics
2) Squad statistics
3) Weapons statistics (firearms and vehicles separately)
4) By weeks statistics
5) Other players statistics (top players killed, teamkilled, killers and teamkillers)

## Limitations

- If you change nickname, then your statistics will count from scratch. That's because there is no way to get the player's steam id. Can be avoided by creating a ticket via [this form (in russian)](https://docs.google.com/forms/d/e/1FAIpQLSfKyUsQzf0Hrv6rgZdbbvN2wh0KPzN5r3Ag-Uf2oETxMMCDUw/viewform)
- Statistics will not be 100% accurate because of possible bugs in the replay
- Since anti ddos protection was added to the website it has become impossible for a common user to parse replays. If you need help with that, you can contact the author through the contacts below

## How to get statistics

### If you have already installed NodeJS and yarn

1. Install dependencies
```sh
yarn install
```
2. Prepare replays list and start parsing replays
```sh
yarn build-with-prepare
```
or
```sh
yarn prepare-replays
yarn build
```
3. Get statistics from folder `output`

## Contributing

If you find bugs in the app or want to suggest new features, you should open the issue

## Contacts

- Discord: [link](https://discordapp.com/users/270491849066545153)
- Steam: [link](https://steamcommunity.com/id/Afgan0r)
- Telegram: [link](https://t.me/Afgan0r)

## License

This app is licensed under the GNU General Public License ([GPLv3](https://github.com/Afgan0r/sg-replay-parser/blob/master/LICENSE)).
