type Kills = number;
type Teamkills = number;
type Deaths = number;
type Score = number;

type GlobalPlayerWeekStatistics = {
  date: Date;
  week: `${number}${number}${number}${number}-${number}${number}`; // 2022-35
  totalPlayedGames: number;
  kills: Kills;
  teamkills: Teamkills;
  deaths: Deaths;
  kdRatio: Score;
  score: Score;
};

type GlobalPlayerStatistics = {
  playerName: PlayerName;
  lastSquadPrefix: PlayerPrefix;
  totalPlayedGames: number;
  kills: Kills;
  teamkills: Teamkills;
  deaths: Deaths;
  kdRatio: Score;
  totalScore: Score;
  lastPlayedGameDate: Date;
  byWeeks: GlobalPlayerWeekStatistics[];
};

type PlayerGameResult = Pick<PlayerInfo, 'name' | 'kills' | 'teamkills' | 'isDead'>;

type GlobalSquadStatistics = {
  prefix: NonNullable<PlayerPrefix>;
  kills: Kills;
  teamkills: Teamkills;
  score: Score;
  players: Omit<GlobalPlayerStatistics, 'lastSquadPrefix' | 'byWeeks'>[];
};
