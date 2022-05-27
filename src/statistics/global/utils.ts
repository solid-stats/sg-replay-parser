export const calculateDeaths = (
  deaths: Deaths,
  isDead: boolean,
  isDeadByTeamkill: boolean,
): Deaths => {
  let totalDeaths = deaths.total;
  let deathsByTeamkills = deaths.byTeamkills;

  if (isDead) {
    if (isDeadByTeamkill) deathsByTeamkills += 1;
    else totalDeaths += 1;
  }

  return {
    total: totalDeaths,
    byTeamkills: deathsByTeamkills,
  };
};

// in some situations (when the player changes the current game slot)
// there may be a situation when 2 entities are attached to one player
// and this leads to several additional total games played
// in such situation we should combine those game results
export const combineGameResults = (gameResults: PlayerInfo[]): PlayerInfo[] => {
  console.log(gameResults.filter((val) => val.name.includes('Ferzb')));

  if (gameResults.filter((val) => val.name.includes('Ferzb')).length > 1) {
    console.log(gameResults.filter((val) => val.name.includes('Ferzb')));
  }
  const newGameResults: PlayerInfo[] = [];

  gameResults.forEach((gameResult) => {
    const currentResultIndex = newGameResults.findIndex(
      (results) => results.name === gameResult.name,
    );

    if (currentResultIndex !== -1) {
      const currentResults = newGameResults[currentResultIndex];

      newGameResults[currentResultIndex] = {
        id: gameResult.id,
        name: gameResult.name,
        side: gameResult.side,
        kills: gameResult.kills + currentResults.kills,
        teamkills: gameResult.teamkills + currentResults.teamkills,
        isDead: gameResult.isDead || currentResults.isDead,
        isDeadByTeamkill: gameResult.isDeadByTeamkill || currentResults.isDeadByTeamkill,
      };
    } else {
      newGameResults.push(gameResult);
    }
  });

  return newGameResults;
};
