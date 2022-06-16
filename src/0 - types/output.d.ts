type Statistics = {
  global: GlobalPlayerStatistics[],
  squad: GlobalSquadStatistics[],
  byRotations: StatisticsByRotation[] | null,
};

type StatisticsForOutput = Record<GameType, Statistics>;

type ParsedReplays = Record<GameType, AlreadyParsedReplays>;

type ByWeeksOutputStatistics = GlobalPlayerWeekStatistics & {
  startDate: string,
  endDate: string,
};

type GlobalOutputStatistics = Omit<GlobalPlayerStatistics, 'byWeeks'> & {
  byWeeks: ByWeeksOutputStatistics[]
};

type OutputStatistics = {
  global: GlobalOutputStatistics[],
  squad: GlobalSquadStatistics[]
};

type OutputStatisticsByRotation = Omit<StatisticsByRotation, 'startDate' | 'endDate' | 'stats'> & {
  startDate: string,
  endDate: string | null,
  stats: OutputStatistics,
};
