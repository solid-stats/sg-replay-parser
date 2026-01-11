import { keyBy, uniq } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import { forbiddenWeapons } from '../../0 - utils/weaponsStatistic';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import calculateDistance from '../utils/calculateDistance';
import { secondsInFrame } from '../utils/consts';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostKillsWithSmallWalkedDistance = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostKillsWithSmallWalkedDistance: limitAndOrder(
    statistics.mostKillsWithSmallWalkedDistance,
    ['count', 'minDistance'],
    ['desc', 'asc'],
  ),
});

const maxWalkedDistance = 1000;
const minTimeWalked = 20 * 60;

const calculateWalkedInfo = (replayInfo: ReplayInfo, player: PlayerInfo): {
  distance: number;
  time: number
} | null => {
  const entity = replayInfo.entities[player.id];

  if (entity.type === 'vehicle') throw new Error('Player is a vehicle');

  const entityPositions = entity.positions;
  let walkedDistance = 0;
  let timeWalked = 0;

  // We use `some` because `return true` will stop processing the array
  // because if the player is dead he cannot move anymore
  // More here: https://stackoverflow.com/questions/2641347/short-circuit-array-foreach-like-calling-break
  entityPositions.some((posInfo, frame) => {
    if (frame === 0) return false;

    // eslint-disable-next-line array-element-newline
    const [pos, , consciousState, isInVehicle, , isPlayer] = posInfo;

    // unit is dead, stop processing the array
    if (consciousState === 0) return true;

    const [prevPos] = entityPositions[frame - 1];

    const distance = calculateDistance(pos, prevPos);

    if (!isInVehicle && isPlayer) {
      walkedDistance += distance;
      timeWalked += secondsInFrame;
    }

    return false;
  });

  if (walkedDistance === 0 || timeWalked === 0) return null;

  return { distance: walkedDistance, time: timeWalked };
};

const mostKillsWithSmallWalkedDistance = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nominees = keyBy<MostKillsWithSmallWalkedDistance>(
    result.mostKillsWithSmallWalkedDistance,
    'id',
  );

  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    const [, , killedId, killInfo] = event;

    if (killInfo[0] === 'null' || !killInfo[1]) return;

    const [killerId, weaponName] = killInfo;
    const killer = players[killerId];
    const killerEntity = replayInfo.entities[killerId];

    if (
      vehiclesName.includes(weaponName.toLowerCase())
      || !killer
      || killerEntity.type === 'vehicle'
      || vehicles[killedId]
      || forbiddenWeapons.includes(weaponName.toLowerCase())
    ) return;

    const entityName = getPlayerName(killer.name)[0];
    const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

    const walkedInfo = calculateWalkedInfo(replayInfo, killer);

    if (walkedInfo === null) return;

    const { distance, time } = walkedInfo;

    if (distance > maxWalkedDistance || time <= minTimeWalked) return;

    const emptyNominee: MostKillsWithSmallWalkedDistance = {
      id,
      name,
      count: 0,
      minDistance: distance,
    };
    const currentNominee = nominees[id] || emptyNominee;

    nominees[id] = {
      id,
      name,
      count: currentNominee.count + 1,
      minDistance: distance < currentNominee.minDistance
        ? distance
        : currentNominee.minDistance,
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostKillsWithSmallWalkedDistance: Object.values(nominees),
    },
  };
};

export default mostKillsWithSmallWalkedDistance;
