type Kills = number;
type Teamkills = number;
type Deaths = {
  total: number;
  byTeamkills: number;
};
type Score = number;

type GlobalPlayerWeekStatistics = {
  week: `${number}${number}${number}${number}-${number}${number}`; // 2022-35
  startDate: string;
  endDate: string;
  totalPlayedGames: number;
  kills: Kills;
  vehicleKills: Kills;
  teamkills: Teamkills;
  deaths: Deaths;
  kdRatio: Score;
  score: Score;
};

type GlobalPlayerStatistics = {
  name: PlayerName;
  lastSquadPrefix: PlayerPrefix;
  totalPlayedGames: number;
  kills: Kills;
  vehicleKills: Kills;
  teamkills: Teamkills;
  deaths: Deaths;
  kdRatio: Score;
  totalScore: Score;
  lastPlayedGameDate: Date;
  byWeeks: GlobalPlayerWeekStatistics[];
  weapons: WeaponStatistic[];
};

type PlayerGameResult = Omit<PlayerInfo, 'id' | 'side'>;

type GlobalSquadStatistics = {
  prefix: NonNullable<PlayerPrefix>;
  averagePlayersCount: number;
  kills: Kills;
  averageKills: number;
  teamkills: Teamkills;
  averageTeamkills: number;
  score: Score;
  players: PlayerName[];
};

type StatisticsByRotation = {
  totalGames: number;
  startDate: Date;
  endDate: Date | null;
  stats: {
    global: GlobalPlayerStatistics[];
    squad: GlobalSquadStatistics[];
  }
};
