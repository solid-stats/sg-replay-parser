export const defaultStatistics: Omit<GlobalPlayerStatistics, 'id' | 'name' | 'lastSquadPrefix' | 'lastPlayedGameDate'> = {
  isShow: true,
  totalPlayedGames: 0,
  kills: 0,
  killsFromVehicle: 0,
  vehicleKills: 0,
  teamkills: 0,
  deaths: {
    total: 0,
    byTeamkills: 0,
  },
  kdRatio: 0,
  killsFromVehicleCoef: 0,
  totalScore: 0,
  byWeeks: [],
  weapons: [],
  vehicles: [],
  killed: [],
  killers: [],
  teamkilled: [],
  teamkillers: [],
};

export const defaultWeekStatistics: Omit<GlobalPlayerWeekStatistics, 'week' | 'date' | 'startDate' | 'endDate'> = {
  totalPlayedGames: 0,
  kills: 0,
  killsFromVehicle: 0,
  vehicleKills: 0,
  teamkills: 0,
  deaths: {
    total: 0,
    byTeamkills: 0,
  },
  kdRatio: 0,
  killsFromVehicleCoef: 0,
  score: 0,
};

export const playerStatsSort = [['totalScore', 'totalPlayedGames', 'kills'], ['desc', 'desc', 'desc']];
