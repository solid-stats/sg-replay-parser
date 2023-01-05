import bestDeathToGamesRatioFormatter from './formatters/bestDeathToGamesRatio';
import worstDeathToGamesRatioFormatter from './formatters/worstDeathToGamesRatio';

const formatters: Record<YearStatisticsKeys, (stats: WholeYearStatisticsResult) => string> = {
  bestDeathToGamesRatio: bestDeathToGamesRatioFormatter,
  bestVehicle: () => '',
  bestWeapon: () => '',
  mostATKills: () => '',
  mostDisconnects: () => '',
  mostDistanceInVehicle: () => '',
  mostDistantKill: () => '',
  mostFlyingTimeInGroundVehicle: () => '',
  mostFrequentCS: () => '',
  mostFrequentTL: () => '',
  mostHeightHeli: () => '',
  mostHeightPlane: () => '',
  mostKilledByTeamkills: () => '',
  mostPopularMission: () => '',
  mostPopularMissionMaker: () => '',
  mostShots: () => '',
  mostTeamkills: () => '',
  mostTeamkillsInOneGame: () => '',
  mostTimeAlive: () => '',
  mostTimeInFlyingVehicle: () => '',
  mostTimeInGroundVehicle: () => '',
  mostTimeInVehicle: () => '',
  mostTimeWalked: () => '',
  mostWalkedDistance: () => '',
  worstDeathToGamesRatio: worstDeathToGamesRatioFormatter,
};

export default formatters;
