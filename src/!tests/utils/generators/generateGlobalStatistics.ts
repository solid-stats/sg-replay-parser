import { defaultStatistics } from '../../../3 - statistics/consts';

const generateGlobalStatistics = (name: PlayerName, totalPlayedGames: GlobalPlayerStatistics['totalPlayedGames'], date: string, isShow?: boolean) => ({
  ...defaultStatistics,
  isShow: isShow === undefined ? true : isShow,
  name,
  lastSquadPrefix: null,
  lastPlayedGameDate: date,
  totalPlayedGames,
});

export default generateGlobalStatistics;
