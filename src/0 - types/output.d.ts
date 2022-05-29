type Statistics = {
  global: GlobalPlayerStatistics[],
  squad: GlobalSquadStatistics[],
  byRotations: StatisticsByRotation[] | null,
};

type StatisticsForOutput = {
  sg: Statistics,
  mace: Statistics,
};
