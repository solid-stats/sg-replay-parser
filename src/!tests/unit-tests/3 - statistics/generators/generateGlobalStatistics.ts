import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';

import calculateKDRatio from '../../../../0 - utils/calculateKDRatio';
import calculateScore from '../../../../0 - utils/calculateScore';
import { dayjsUTC } from '../../../../0 - utils/dayjs';
import getPlayerName from '../../../../0 - utils/getPlayerName';
import pipe from '../../../../0 - utils/pipe';
import { generateDefaultWeapons } from '../../1 - replays, 2 - parseReplayInfo/utils';

const generateWeekStats = (
  playerInfo: PlayerInfo,
  weekInfo: GlobalPlayerWeekStatistics,
  date: string,
): GlobalPlayerWeekStatistics => {
  const kills = weekInfo.kills + playerInfo.kills;
  const teamkills = weekInfo.teamkills + playerInfo.teamkills;
  const vehicleKills = weekInfo.vehicleKills + playerInfo.vehicleKills;
  const deaths = {
    total: playerInfo.isDead ? weekInfo.deaths.total + 1 : weekInfo.deaths.total,
    byTeamkills: playerInfo.isDeadByTeamkill
      ? weekInfo.deaths.byTeamkills + 1
      : weekInfo.deaths.byTeamkills,
  };
  const utcDate = dayjsUTC(date);
  const week = weekInfo.week || utcDate.format('YYYY-WW') as WeekNumber;
  const startDate = weekInfo.startDate || utcDate.startOf('isoWeek').toJSON();
  const endDate = weekInfo.endDate || utcDate.endOf('isoWeek').toJSON();

  return {
    week,
    startDate,
    endDate,
    totalPlayedGames: 4,
    kills,
    teamkills,
    vehicleKills,
    deaths,
    kdRatio: calculateKDRatio(kills, teamkills, deaths),
    score: calculateScore(4, kills, teamkills, deaths),
  };
};

const generateGlobalStats = (
  playerInfo: PlayerInfo,
  currentStats: GlobalPlayerStatistics,
  player: string,
  gameIndex: number,
  date: string,
) => {
  const [name, prefix] = getPlayerName(player);

  const weekIndex = Math.floor(gameIndex / 4);

  const weeks = cloneDeep(currentStats.byWeeks);
  const weekInfo = weeks[weekIndex] || {
    totalPlayedGames: 4,
    kills: 0,
    teamkills: 0,
    vehicleKills: 0,
    deaths: { total: 0, byTeamkills: 0 },
  };

  weeks[weekIndex] = generateWeekStats(playerInfo, weekInfo, date);

  const kills = currentStats.kills + playerInfo.kills;
  const teamkills = currentStats.teamkills + playerInfo.teamkills;
  const vehicleKills = currentStats.vehicleKills + playerInfo.vehicleKills;
  const deaths = {
    total: playerInfo.isDead ? currentStats.deaths.total + 1 : currentStats.deaths.total,
    byTeamkills: playerInfo.isDeadByTeamkill
      ? currentStats.deaths.byTeamkills + 1
      : currentStats.deaths.byTeamkills,
  };

  return {
    name,
    lastPlayedGameDate: date,
    lastSquadPrefix: prefix,
    totalPlayedGames: gameIndex + 1,
    kills,
    vehicleKills,
    teamkills,
    deaths,
    kdRatio: calculateKDRatio(kills, teamkills, deaths),
    totalScore: calculateScore(gameIndex + 1, kills, teamkills, deaths),
    byWeeks: weeks,
    weapons: generateDefaultWeapons(kills),
  };
};

const sort = (statistics: GlobalPlayerStatistics[]) => orderBy(statistics, 'totalScore', 'desc');
const reverseWeeks = (statistics: GlobalPlayerStatistics[]) => (statistics.map((stats) => ({
  ...stats,
  byWeeks: stats.byWeeks.reverse(),
})));

const generateGlobalStatistics = (
  playersGameResult: PlayersGameResult[],
): GlobalPlayerStatistics[] => {
  const globalStatisticsRaw: Record<PlayerName, GlobalPlayerStatistics> = {};

  playersGameResult.forEach(({ date, result }, index) => {
    result.forEach((playerInfo) => {
      const currentStats = globalStatisticsRaw[playerInfo.name] || {
        name: '',
        lastPlayedGameDate: date,
        lastSquadPrefix: '',
        totalPlayedGames: 0,
        kills: 0,
        teamkills: 0,
        vehicleKills: 0,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 0,
        totalScore: 0,
        byWeeks: [],
        weapons: [],
      };

      globalStatisticsRaw[playerInfo.name] = generateGlobalStats(
        playerInfo,
        currentStats,
        playerInfo.name,
        index,
        date,
      );
    });
  });
  const globalStatistics = pipe(reverseWeeks, sort)(Object.values(globalStatisticsRaw));

  return globalStatistics;
};

export default generateGlobalStatistics;
