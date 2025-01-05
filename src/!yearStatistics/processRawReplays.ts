import logger from '../0 - utils/logger';
import pipe from '../0 - utils/pipe';
import { fetchReplayInfo } from '../1 - replays/parseReplays';
import bestRandomshik, { sortBestRandomshik } from './nominations/bestRandomshik';
import bestWeaponsAndVehicles, { sortBestWeaponsAndVehicles } from './nominations/bestWeaponAndVehicle';
import mostAAKills, { sortMostAAKills } from './nominations/mostAAKills';
import mostATKills, { sortMostATKills } from './nominations/mostATKills';
import mostDisconnects, { sortMostDisconnects } from './nominations/mostDisconnects';
import mostDistance, { sortMostDistance } from './nominations/mostDistance';
import mostDistantKill, { sortMostDistantKill } from './nominations/mostDistantKill';
import mostFrequentCS, { sortMostFrequentCS } from './nominations/mostFrequentCS';
import mostFrequentTL, { sortMostFrequentTL } from './nominations/mostFrequentTL';
import mostHeight, { sortMostHeight } from './nominations/mostHeight';
import mostKillsFromCommanderSlot, { sortMostKillsFromCommanderSlot } from './nominations/mostKillsFromCommanderSlot';
import mostKillsFromMedicSlot, { sortMostKillsFromMedicSlot } from './nominations/mostKillsFromMedicSlot';
import mostKillsFromOldWeapons, { sortMostKillsFromOldWeapons } from './nominations/mostKillsFromOldWeapons';
import mostKillsInCQB, { sortMostKillsInCQB } from './nominations/mostKillsInCQB';
import mostKillsWithSmallWalkedDistance, { sortMostKillsWithSmallWalkedDistance } from './nominations/mostKillsWithSmallWalkedDistance';
import mostPlaneKillsFromPlane, { sortMostPlaneKillsFromPlane } from './nominations/mostPlaneKillsFromPlane';
import { processMissionDates } from './nominations/mostPopularMission';
import mostPopularMissionMaker, { sortMostPopularMissionMaker } from './nominations/mostPopularMissionMaker';
import mostShots, { sortMostShots } from './nominations/mostShots';
import mostTime, { processTime, sortMostTime } from './nominations/mostTime';
import { printFinish } from './utils/printText';

const processRawReplays = async (
  result: WholeYearStatisticsResult,
  replays: Replay[],
  globalStatistics: GlobalPlayerStatistics[],
): Promise<WholeYearStatisticsResult> => {
  logger.info('Started data process for nominations which requires raw replays data.');

  let newResult = { ...result };

  // eslint-disable-next-line no-restricted-syntax
  for (const replay of replays) {
    // eslint-disable-next-line no-await-in-loop
    const replayInfo = await fetchReplayInfo(replay.filename) as ReplayInfo;

    if (!replayInfo) break;

    newResult = pipe(
      mostShots,
      mostKillsFromOldWeapons,
      mostKillsFromCommanderSlot,
      mostKillsFromMedicSlot,
      mostPopularMissionMaker,
      mostDisconnects,
      mostFrequentCS,
      mostFrequentTL,
      mostDistantKill,
      bestWeaponsAndVehicles,
      mostATKills,
      mostAAKills,
      mostKillsWithSmallWalkedDistance,

      mostDistance,
      // bestRandomshik should go after mostDistance
      bestRandomshik,

      mostHeight,
      mostTime,
      mostKillsInCQB,
      mostPlaneKillsFromPlane,
    )({
      replay,
      replayInfo,
      result: newResult,
      globalStatistics,
    }).result;
  }

  // process or sort and limit
  newResult = pipe(
    sortMostShots,
    sortMostKillsFromOldWeapons,
    sortMostKillsFromCommanderSlot,
    sortMostPopularMissionMaker,
    sortMostDisconnects,
    sortMostFrequentCS,
    sortMostFrequentTL,
    sortMostDistantKill,
    sortBestWeaponsAndVehicles,
    sortMostATKills,
    sortMostAAKills,
    sortMostHeight,
    sortMostTime,
    sortMostKillsInCQB,
    sortMostKillsFromMedicSlot,
    sortMostPlaneKillsFromPlane,
    sortMostKillsWithSmallWalkedDistance,

    // sortBestRandomshik should go before sortMostDistance
    sortBestRandomshik,
    sortMostDistance,

    processTime,
    processMissionDates,
  )(newResult);

  printFinish();

  return newResult;
};

export default processRawReplays;
