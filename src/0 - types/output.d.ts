type Statistics = {
  global: GlobalPlayerStatistics[],
  squad: GlobalSquadStatistics[],
  byRotations: StatisticsByRotation[] | null,
};

type StatisticsForOutput = Record<GameType, Statistics>;

type ParsedReplays = Record<GameType, AlreadyParsedReplays>;
