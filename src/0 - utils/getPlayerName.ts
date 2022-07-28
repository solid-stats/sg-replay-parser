import isNull from 'lodash/isNull';

const getPlayerName = (playerName: PlayerName): [PlayerName, PlayerPrefix] => {
  if (!playerName.includes('[')) return [playerName, null];

  const squadPrefixRegex = /\[.*\]/;
  const matchResult = playerName.match(squadPrefixRegex);

  if (isNull(matchResult)) return [playerName, null];

  const squadPrefix = matchResult[0];
  const name = playerName.replace(squadPrefixRegex, '');

  return [name.trim(), squadPrefix.trim()];
};

export default getPlayerName;
