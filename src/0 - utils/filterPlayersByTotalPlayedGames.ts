const filterPlayersByTotalPlayedGames = (
  statistics: GlobalPlayerStatistics[],
  // used only in statistics by rotations
  // to reduce the number of games needed to be in the statistics
  gamesCount?: number,
) => {
  const minGamesCount = gamesCount
    ? (15 * gamesCount) / 100 // 15%
    : 20;

  return statistics.filter(
    (stats) => stats.totalPlayedGames > minGamesCount,
  );
};

export default filterPlayersByTotalPlayedGames;
