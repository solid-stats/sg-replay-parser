type Params = {
  statistics: GlobalPlayerStatistics[];
  gamesCount: number;
  type?: 'remove' | 'not show';
  isNewYearStats?: boolean;
};

const filterPlayersByTotalPlayedGames = ({
  statistics,
  gamesCount,
  type,
  isNewYearStats = false,
}: Params) => {
  let minGamesCount = 20;

  if (isNewYearStats || (!isNewYearStats && gamesCount < 125)) {
    minGamesCount = (15 * gamesCount) / 100; // 15%
  }

  const condition = (count) => count >= minGamesCount;

  if (type === 'not show') {
    return statistics.map((stats) => (
      condition(stats.totalPlayedGames)
        ? { ...stats, isShow: true }
        : { ...stats, isShow: false }
    ));
  }

  return statistics.filter(
    (stats) => condition(stats.totalPlayedGames),
  );
};

export default filterPlayersByTotalPlayedGames;
