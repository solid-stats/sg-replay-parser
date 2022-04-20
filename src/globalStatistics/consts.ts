// nickname should be in lower case
export const playersToShowInStatistics = [
  'ultimate',
  'andrade',
  'ultraflex',
  'puma',
  'myliu',
  'flashback',
  'deez',
  'afgan0r',
  'lONDOR',
  't1m',
  'nero',
  'brom',
];

export const defaultStatistics: Omit<GlobalPlayerStatistics, 'playerName' | 'lastSquadPrefix'> = {
  totalPlayedGames: 0,
  kills: 0,
  teamkills: 0,
  deaths: 0,
  totalScore: 0,
  byWeeks: [],
};
