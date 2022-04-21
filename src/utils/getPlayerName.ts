const getPlayerName = (playerName: PlayerName): [PlayerName, PlayerPrefix | null] => {
  if (!playerName.includes('[')) return [playerName, null];

  const squadPrefixRegex = /\[\w*\]/;
  const squadPrefix = playerName.match(squadPrefixRegex)[0];
  const name = playerName.replace(squadPrefixRegex, '');

  return [name, squadPrefix];
};

export default getPlayerName;
