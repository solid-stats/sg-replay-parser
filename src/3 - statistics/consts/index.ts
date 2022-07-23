export const defaultStatistics: Omit<GlobalPlayerStatistics, 'playerName' | 'lastSquadPrefix' | 'lastPlayedGameDate'> = {
  totalPlayedGames: 0,
  kills: 0,
  vehicleKills: 0,
  teamkills: 0,
  deaths: {
    total: 0,
    byTeamkills: 0,
  },
  kdRatio: 0,
  totalScore: 0,
  byWeeks: [],
  weapons: [],
};

export const defaultWeekStatistics: Omit<GlobalPlayerWeekStatistics, 'week' | 'date'> = {
  totalPlayedGames: 0,
  kills: 0,
  vehicleKills: 0,
  teamkills: 0,
  deaths: {
    total: 0,
    byTeamkills: 0,
  },
  kdRatio: 0,
  score: 0,
};
