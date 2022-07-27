export const defaultStatistics: Omit<GlobalPlayerStatistics, 'name' | 'lastSquadPrefix' | 'lastPlayedGameDate'> = {
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

export const defaultWeekStatistics: Omit<GlobalPlayerWeekStatistics, 'week' | 'date' | 'startDate' | 'endDate'> = {
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
