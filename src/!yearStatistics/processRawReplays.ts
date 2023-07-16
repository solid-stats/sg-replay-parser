import pipe from '../0 - utils/pipe';
import { incrementBarValue, initializeProgressBar, stopAllBarsProgress } from '../0 - utils/progressHandler';
import { fetchReplayInfo } from '../1 - replays/parseReplays';
import bestWeaponsAndVehicles, { sortBestWeaponsAndVehicles } from './nominations/bestWeaponAndVehicle';
import mostATKills, { sortMostATKills } from './nominations/mostATKills';
import mostDisconnects, { sortMostDisconnects } from './nominations/mostDisconnects';
import mostDistance, { sortMostDistance } from './nominations/mostDistance';
import mostDistantKill, { sortMostDistantKill } from './nominations/mostDistantKill';
import mostFrequentCS, { sortMostFrequentCS } from './nominations/mostFrequentCS';
import mostFrequentTL, { sortMostFrequentTL } from './nominations/mostFrequentTL';
import mostHeight, { sortMostHeight } from './nominations/mostHeight';
import mostPopularMissionMaker, { sortMostPopularMissionMaker } from './nominations/mostPopularMissionMaker';
import mostShots, { sortMostShots } from './nominations/mostShots';
import mostTime, { processTime, sortMostTime } from './nominations/mostTime';
import { printFinish } from './utils/printText';

const processRawReplays = async (
  result: WholeYearStatisticsResult,
  replays: Replay[],
): Promise<WholeYearStatisticsResult> => {
  // eslint-disable-next-line no-console
  console.log('Started data process for nominations which requires raw replays data.');

  let newResult = { ...result };

  initializeProgressBar('sg', replays.length);

  // eslint-disable-next-line no-restricted-syntax
  for (const replay of replays) {
    // eslint-disable-next-line no-await-in-loop
    const replayInfo = await fetchReplayInfo(replay.filename);

    if (!replayInfo) {
      incrementBarValue('sg');
      break;
    }

    newResult = pipe(
      mostShots,
      mostPopularMissionMaker,
      mostDisconnects,
      mostFrequentCS,
      mostFrequentTL,
      mostDistantKill,
      bestWeaponsAndVehicles,
      mostATKills,
      mostDistance,
      mostHeight,
      mostTime,
      // mostTimeFlyingInGroundVehicle,
    )({ replay, replayInfo, result: newResult }).result;
    incrementBarValue('sg');
  }

  // process or sort and limit
  newResult = pipe(
    sortMostShots,
    sortMostPopularMissionMaker,
    sortMostDisconnects,
    sortMostFrequentCS,
    sortMostFrequentTL,
    sortMostDistantKill,
    sortBestWeaponsAndVehicles,
    sortMostATKills,
    sortMostDistance,
    sortMostHeight,
    sortMostTime,
    // sortMostTimeFlyingInGroundVehicle,

    processTime,
    // processMostTimeFlyingInGroundVehicle,
  )(newResult);

  stopAllBarsProgress();

  printFinish();

  return newResult;
};

export default processRawReplays;
