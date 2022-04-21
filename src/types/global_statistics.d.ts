type Kills = number;
type Teamkills = number;
type Deaths = number;
type Score = number;

type GlobalPlayerWeekStatistics = {
  week: `${number}${number}${number}${number}-${number}${number}`; // 2022-35
  totalPlayedGames: number;
  kills: Kills;
  teamkills: Teamkills;
  deaths: Deaths;
  score: Score;
};

type GlobalPlayerStatistics = {
  playerName: string;
  lastSquadPrefix: string;
  totalPlayedGames: number;
  kills: Kills;
  teamkills: Teamkills;
  deaths: Deaths;
  totalScore: Score;
  byWeeks: GlobalPlayerWeekStatistics[];
};

type PlayerGameResult = Pick<PlayerInfo, 'name' | 'kills' | 'teamkills' | 'isDead'>;
