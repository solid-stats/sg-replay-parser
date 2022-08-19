import { isNull } from 'lodash';

const getPlayerName = (playerName: PlayerName): [PlayerName, PlayerPrefix] => {
  if (!playerName.includes('[')) return [playerName.trim(), null];

  const squadPrefixRegex = /\[.*\]/;
  const removeBracketsRegex = /[\])}[{(]/g;
  const matchResult = playerName.match(squadPrefixRegex);

  const name = playerName
    .replace(squadPrefixRegex, '') // remove prefix
    .replace(removeBracketsRegex, ''); // remove brackets if prefix isn't correct

  if (isNull(matchResult)) return [name.trim(), null];

  if (matchResult[0] === '[]') return [name.trim(), null];

  const squadPrefix = matchResult[0];

  return [name.trim(), squadPrefix.trim()];
};

export default getPlayerName;
