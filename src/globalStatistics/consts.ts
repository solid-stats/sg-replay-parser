export const defaultStatistics: Omit<GlobalPlayerStatistics, 'playerName' | 'lastSquadPrefix'> = {
  totalPlayedGames: 0,
  kills: 0,
  teamkills: 0,
  deaths: 0,
  totalScore: 0,
  byWeeks: [],
};

export const defaultWeekStatistics: Omit<GlobalPlayerWeekStatistics, 'week'> = {
  kills: 0,
  teamkills: 0,
  deaths: 0,
  score: 0,
};
