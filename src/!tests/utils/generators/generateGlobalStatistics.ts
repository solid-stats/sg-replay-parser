import { dayjsUTCISO } from '../../../0 - utils/dayjs';
import { defaultStatistics } from '../../../3 - statistics/consts';

const generateGlobalStatistics = (name: PlayerName, totalPlayedGames: GlobalPlayerStatistics['totalPlayedGames']) => ({
  ...defaultStatistics,
  name,
  lastSquadPrefix: null,
  lastPlayedGameDate: dayjsUTCISO(),
  totalPlayedGames,
});

export default generateGlobalStatistics;
