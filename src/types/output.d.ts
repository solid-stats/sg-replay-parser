type Statistics = {
  global: GlobalPlayerStatistics[],
  squad: GlobalSquadStatistics[],
  byRotations?: StatisticsByRotation[],
};

type StatisticsForOutput = {
  sg: Statistics,
  mace: Statistics,
};
