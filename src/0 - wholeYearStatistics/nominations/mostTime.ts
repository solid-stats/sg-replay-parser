import { keyBy } from 'lodash';

import getPlayerName from '../../0 - utils/getPlayerName';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import {
  defaultTimeDuration, flyingVehicle, groundVehicle, secondsInFrame,
} from '../utils/consts';
import formatTime from '../utils/formatTime';
import getPlayerVehicleClass from '../utils/getPlayerVehicleClass';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostTime = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostTimeAlive: limitAndOrder(statistics.mostTimeAlive, 'timeInSeconds', 'desc'),
  mostTimeWalked: limitAndOrder(statistics.mostTimeWalked, 'timeInSeconds', 'desc'),
  mostTimeInGroundVehicle: limitAndOrder(statistics.mostTimeInGroundVehicle, 'timeInSeconds', 'desc'),
  mostTimeInFlyingVehicle: limitAndOrder(statistics.mostTimeInFlyingVehicle, 'timeInSeconds', 'desc'),
});

const formatTimeForNominee = (nominee: DefaultTimeNomination) => ({
  ...nominee,
  time: formatTime(nominee.timeInSeconds),
});

export const processTime = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostTimeAlive: statistics.mostTimeAlive.map(formatTimeForNominee),
  mostTimeWalked: statistics.mostTimeWalked.map(formatTimeForNominee),
  mostTimeInGroundVehicle: statistics.mostTimeInGroundVehicle.map(formatTimeForNominee),
  mostTimeInFlyingVehicle: statistics.mostTimeInFlyingVehicle.map(formatTimeForNominee),
});

const mostTime = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const mostTimeAliveNomineesByName = keyBy(result.mostTimeAlive, 'name') as NomineeList<DefaultTimeNomination>;
  const mostTimeWalkedNomineesByName = keyBy(result.mostTimeWalked, 'name') as NomineeList<DefaultTimeNomination>;
  const mostTimeInGroundVehicleNomineesByName = keyBy(result.mostTimeInGroundVehicle, 'name') as NomineeList<DefaultTimeNomination>;
  const mostTimeInFlyingVehicleNomineesByName = keyBy(result.mostTimeInFlyingVehicle, 'name') as NomineeList<DefaultTimeNomination>;
  const { players, vehicles } = getEntities(replayInfo);

  Object.values(players).forEach(({ id: playerId, name: playerName }) => {
    const entity = replayInfo.entities[playerId];

    if (!entity || entity.type === 'vehicle') return;

    const { positions } = entity;
    let timeAlive = 0;
    let timeWalked = 0;
    let timeInGroundVehicle = 0;
    let timeInFlyingVehicle = 0;

    // We use `some` because `return true` will stop processing the array
    // because we count time only when player is alive
    // More here: https://stackoverflow.com/questions/2641347/short-circuit-array-foreach-like-calling-break
    positions.some((positionInfo, frame) => {
      if (positionInfo[2] === 0) return true;

      if (positionInfo[4].length === 0 || positionInfo[5] === 0) return false;

      const isInVehicle = Boolean(positionInfo[3]);

      if (!isInVehicle) timeWalked += secondsInFrame;

      if (isInVehicle) {
        const vehicleClass = getPlayerVehicleClass(
          Object.values(vehicles).map((val) => val.id),
          replayInfo,
          frame,
          playerId,
        );

        if (vehicleClass !== null) {
          if (groundVehicle.includes(vehicleClass)) timeInGroundVehicle += secondsInFrame;

          if (flyingVehicle.includes(vehicleClass)) timeInFlyingVehicle += secondsInFrame;
        }
      }

      timeAlive += secondsInFrame;

      return false;
    });

    const name = getPlayerName(playerName)[0];

    const currentMostTimeAliveNominee = mostTimeAliveNomineesByName[name] || {
      name, time: defaultTimeDuration, timeInSeconds: 0,
    };
    const currentMostTimeWalkedNominee = mostTimeWalkedNomineesByName[name] || {
      name, time: defaultTimeDuration, timeInSeconds: 0,
    };
    const currentMostTimeInGroundVehicleNominee = mostTimeInGroundVehicleNomineesByName[name] || {
      name, time: defaultTimeDuration, timeInSeconds: 0,
    };
    const currentMostTimeInFlyingVehicleNominee = mostTimeInFlyingVehicleNomineesByName[name] || {
      name, time: defaultTimeDuration, timeInSeconds: 0,
    };

    mostTimeAliveNomineesByName[name] = {
      name,
      time: defaultTimeDuration,
      timeInSeconds: currentMostTimeAliveNominee.timeInSeconds + timeAlive,
    };
    mostTimeWalkedNomineesByName[name] = {
      name,
      time: defaultTimeDuration,
      timeInSeconds: currentMostTimeWalkedNominee.timeInSeconds + timeWalked,
    };
    mostTimeInGroundVehicleNomineesByName[name] = {
      name,
      time: defaultTimeDuration,
      timeInSeconds: currentMostTimeInGroundVehicleNominee.timeInSeconds + timeInGroundVehicle,
    };
    mostTimeInFlyingVehicleNomineesByName[name] = {
      name,
      time: defaultTimeDuration,
      timeInSeconds: currentMostTimeInFlyingVehicleNominee.timeInSeconds + timeInFlyingVehicle,
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostTimeAlive: Object.values(mostTimeAliveNomineesByName),
      mostTimeWalked: Object.values(mostTimeWalkedNomineesByName),
      mostTimeInGroundVehicle: Object.values(mostTimeInGroundVehicleNomineesByName),
      mostTimeInFlyingVehicle: Object.values(mostTimeInFlyingVehicleNomineesByName),
    },
  };
};

export default mostTime;
