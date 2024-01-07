import bestDeathToGamesRatioFormatter from './formatters/bestDeathToGamesRatio';
import bestRandomshikFormatter from './formatters/bestRandomshik';
import bestVehicleFormatter from './formatters/bestVehicle';
import bestWeaponFormatter from './formatters/bestWeapon';
import mostAAKillsFormatter from './formatters/mostAAKills';
import mostATKillsFormatter from './formatters/mostATKills';
import mostDeathsFromTeamkillsFormatter from './formatters/mostDeathsFromTeamkills';
import mostDisconnectsFormatter from './formatters/mostDisconnects';
import mostDistanceInVehicleFormatter from './formatters/mostDistanceInVehicle';
import mostDistantKillFormatter from './formatters/mostDistantKill';
import mostFrequentCSFormatter from './formatters/mostFrequentCS';
import mostFrequentTLFormatter from './formatters/mostFrequentTL';
import mostHeightHeliFormatter from './formatters/mostHeightHeli';
import mostHeightPlaneFormatter from './formatters/mostHeightPlane';
import mostKillsFromCommanderSlotFormatter from './formatters/mostKillsFromCommanderSlot';
import mostKillsFromMedicSlotFormatter from './formatters/mostKillsFromMedicSlot';
import mostKillsFromOldWeaponsFormatter from './formatters/mostKillsFromOldWeapons';
import mostKillsInCQBFormatter from './formatters/mostKillsInCQB';
import mostPopularMissionFormatter from './formatters/mostPopularMission';
import mostPopularMissionMakerFormatter from './formatters/mostPopularMissionMaker';
import mostShotsFormatter from './formatters/mostShots';
import mostTeamkillsFormatter from './formatters/mostTeamkills';
import mostTeamkillsInOneGameFormatter from './formatters/mostTeamkillsInOneGame';
import mostTimeAliveFormatter from './formatters/mostTimeAlive';
import mostTimeInFlyingVehicleFormatter from './formatters/mostTimeInFlyingVehicle';
import mostTimeInGroundVehicleFormatter from './formatters/mostTimeInGroundVehicle';
import mostTimeInVehicleFormatter from './formatters/mostTimeInVehicle';
import mostTimeWalkedFormatter from './formatters/mostTimeWalked';
import mostWalkedDistanceFormatter from './formatters/mostWalkedDistance';
import worstDeathToGamesRatioFormatter from './formatters/worstDeathToGamesRatio';

const formatters: Record<YearStatisticsKeys, (stats: WholeYearStatisticsResult) => string> = {
  bestDeathToGamesRatio: bestDeathToGamesRatioFormatter,
  worstDeathToGamesRatio: worstDeathToGamesRatioFormatter,
  bestVehicle: bestVehicleFormatter,
  bestWeapon: bestWeaponFormatter,
  mostATKills: mostATKillsFormatter,
  mostAAKills: mostAAKillsFormatter,
  mostKillsFromCommanderSlot: mostKillsFromCommanderSlotFormatter,
  mostDisconnects: mostDisconnectsFormatter,
  mostDistanceInVehicle: mostDistanceInVehicleFormatter,
  mostDistantKill: mostDistantKillFormatter,
  mostFrequentCS: mostFrequentCSFormatter,
  mostFrequentTL: mostFrequentTLFormatter,
  mostHeightHeli: mostHeightHeliFormatter,
  mostHeightPlane: mostHeightPlaneFormatter,
  mostPopularMission: mostPopularMissionFormatter,
  mostPopularMissionMaker: mostPopularMissionMakerFormatter,
  mostShots: mostShotsFormatter,
  mostTeamkills: mostTeamkillsFormatter,
  mostTeamkillsInOneGame: mostTeamkillsInOneGameFormatter,
  mostTimeAlive: mostTimeAliveFormatter,
  mostTimeInFlyingVehicle: mostTimeInFlyingVehicleFormatter,
  mostTimeInGroundVehicle: mostTimeInGroundVehicleFormatter,
  mostTimeInVehicle: mostTimeInVehicleFormatter,
  mostTimeWalked: mostTimeWalkedFormatter,
  mostWalkedDistance: mostWalkedDistanceFormatter,
  mostDeathsFromTeamkills: mostDeathsFromTeamkillsFormatter,
  mostKillsFromOldWeapons: mostKillsFromOldWeaponsFormatter,
  mostKillsInCQB: mostKillsInCQBFormatter,
  bestRandomshik: bestRandomshikFormatter,
  mostKillsFromMedicSlot: mostKillsFromMedicSlotFormatter,
};

export default formatters;
