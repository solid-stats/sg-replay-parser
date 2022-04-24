# Stats generator for Solid Games

## About

This app gets all replays from https://replays.solidgames.ru/ and then calculates the stats for each player and squad

## Output

This application outputs 3 types of files:
1) General statistics for all players
2) General statistics for each squads
3) A folder with players statistics by squads
4) A folder with statistics by week for each player
5) JSON file with all information

## Limitations

- If you change nickname, then your statistics will count from scratch. That's because there is no way to get the player's steam id
- Statistics will not be 100% accurate because of possible mistakes in the replay

## How to get statistics

### If you have already installed NodeJS and yarn

1. Install dependencies
```sh
yarn install
```
2. Start parsing replays
```sh
yarn start
```
3) Get statistics from folder `output`

### Using Docker

1) Build docker image

```sh
docker build -t sg-parser .
```

2) Get output folder from docker image

```sh
docker create --name sg-parser sg-parser &&
docker cp sg-parser:/app/output/ your_folder_name/ &&
docker rm sg-parser
```

## Contributing

If you find bugs in the app or want to suggest new features, you should open the issue

## Development

If you want to change the code, you can fork this repository or open a pull request

In order to start development, you should install NodeJS and yarn, and then start app in dev mode:

```sh
yarn dev
```

## Contacts

- Discord: [link](https://discordapp.com/users/270491849066545153)
- Steam: [link](https://steamcommunity.com/id/Afgan0r)

## License

This app is licensed under the GNU General Public License ([GPLv3](https://github.com/Afgan0r/sg-replay-parser/blob/master/LICENSE)).
