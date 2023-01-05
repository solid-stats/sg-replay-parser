import { keyBy } from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import calculateDistance from '../utils/calculateDistance';
import getPlayerVehicleClass from '../utils/getPlayerVehicleClass';
import limitAndOrder from '../utils/limitAndOrder';

// max speed is 300 km/h
// 300 km/h is 83 m/s
// 1 frame = 5s
// 83 * 5 = 415m
const distanceLimit = 415;
const possibleVehicles: RawVehicleClass[] = ['car', 'truck', 'sea', 'apc', 'tank'];

export const sortMostDistance = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostWalkedDistance: limitAndOrder(statistics.mostWalkedDistance, 'distance', 'desc'),
  mostDistanceInVehicle: limitAndOrder(statistics.mostDistanceInVehicle, 'distance', 'desc'),
});

const mostDistance = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const walkedDistanceNomineesByName = keyBy(result.mostWalkedDistance, 'name') as NomineeList<DefaultDistanceNomination>;
  const distanceInVehicleNomineesByName = keyBy(result.mostDistanceInVehicle, 'name') as NomineeList<DefaultDistanceNomination>;
  const { players, vehicles } = getEntities(replayInfo);

  Object.values(players).forEach(({ id: playerId, name: playerName }) => {
    const entity = replayInfo.entities[playerId];

    if (entity.type === 'vehicle') return;

    const entityPositions = entity.positions;
    let walkedDistance = 0;
    let distanceInVehicle = 0;

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

      if (
        !isPlayer
        || distance > distanceLimit
      ) return false;

      if (!isInVehicle) walkedDistance += distance;

      if (isInVehicle) {
        const vehicleClass: RawVehicleClass | null = getPlayerVehicleClass(
          Object.values(vehicles).map((val) => val.id),
          replayInfo,
          frame,
          playerId,
        );

        if (
          vehicleClass !== null
          && possibleVehicles.includes(vehicleClass)
        ) distanceInVehicle += distance;
      }

      return false;
    });

    const name = getPlayerName(playerName)[0];
    const currentWalkedNominee = walkedDistanceNomineesByName[name] || { name, distance: 0 };
    const currentDistanceInVehicleNominee = distanceInVehicleNomineesByName[name] || {
      name, distance: 0,
    };

    walkedDistanceNomineesByName[name] = {
      name, distance: currentWalkedNominee.distance + walkedDistance,
    };
    distanceInVehicleNomineesByName[name] = {
      name, distance: currentDistanceInVehicleNominee.distance + distanceInVehicle,
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostWalkedDistance: Object.values(walkedDistanceNomineesByName),
      mostDistanceInVehicle: Object.values(distanceInVehicleNomineesByName),
    },
  };
};

export default mostDistance;
