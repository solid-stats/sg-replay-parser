import { defaultStatistics } from '../../../modules/statistics/consts';

const generateGlobalStatistics = (
  name: PlayerName,
  totalPlayedGames: TotalPlayedGames,
  date: string,
  isShow?: boolean,
) => ({
  ...defaultStatistics,
  isShow: isShow === undefined ? true : isShow,
  id: name,
  name,
  lastSquadPrefix: null,
  lastPlayedGameDate: date,
  totalPlayedGames,
});

export default generateGlobalStatistics;
