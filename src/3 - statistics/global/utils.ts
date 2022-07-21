import { unionWeaponsStatistic } from '../../0 - utils/weaponsStatistic';

type Params = {
  deaths: Deaths,
  isDead: boolean,
  isDeadByTeamkill: boolean,
};

export const calculateDeaths = ({
  deaths,
  isDead,
  isDeadByTeamkill,
}: Params): Deaths => {
  let totalDeaths = deaths.total;
  let deathsByTeamkills = deaths.byTeamkills;

  if (isDead) {
    if (isDeadByTeamkill) deathsByTeamkills += 1;

    totalDeaths += 1;
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
        weapons: unionWeaponsStatistic(gameResult.weapons, currentResults.weapons),
      };
    } else {
      newGameResults.push(gameResult);
    }
  });

  return newGameResults;
};
