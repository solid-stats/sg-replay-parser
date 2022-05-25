# Stats generator for Solid Games

![image](https://user-images.githubusercontent.com/46472464/170368201-75d53a23-cc63-4860-8692-2e888f443037.png)

## About

This app gets all replays from https://replays.solidgames.ru/ and then calculates the stats for each player and squad

## Example of data usage (not my website):

https://solid-stats.web.app/

## Output

This application outputs 2 JSON files:
1) With global and by squad statistics
2) Statistics by each rotation, each rotation has global and squad statistics

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
