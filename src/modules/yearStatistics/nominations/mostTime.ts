import { keyBy } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import getEntities from '../../parsing/getEntities';
import {
  defaultTimeDuration, flyingVehicle, groundVehicle, secondsInFrame,
} from '../utils/consts';
import formatTime from '../utils/formatTime';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import getPlayerVehicleClass from '../utils/getPlayerVehicleClass';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostTime = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostTimeAlive: limitAndOrder(statistics.mostTimeAlive, 'timeInSeconds', 'desc'),
  mostTimeWalked: limitAndOrder(statistics.mostTimeWalked, 'timeInSeconds', 'desc'),
  mostTimeInVehicle: limitAndOrder(statistics.mostTimeInVehicle, 'timeInSeconds', 'desc'),
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
  mostTimeInVehicle: statistics.mostTimeInVehicle.map(formatTimeForNominee),
  mostTimeInGroundVehicle: statistics.mostTimeInGroundVehicle.map(formatTimeForNominee),
  mostTimeInFlyingVehicle: statistics.mostTimeInFlyingVehicle.map(formatTimeForNominee),
});

const mostTime = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const mostTimeAliveNomineesById = keyBy(result.mostTimeAlive, 'id') as NomineeList<DefaultTimeNomination>;
  const mostTimeWalkedNomineesById = keyBy(result.mostTimeWalked, 'id') as NomineeList<DefaultTimeNomination>;
  const mostTimeInVehicleNomineesById = keyBy(result.mostTimeInVehicle, 'id') as NomineeList<DefaultTimeNomination>;
  const mostTimeInGroundVehicleNomineesById = keyBy(result.mostTimeInGroundVehicle, 'id') as NomineeList<DefaultTimeNomination>;
  const mostTimeInFlyingVehicleNomineesById = keyBy(result.mostTimeInFlyingVehicle, 'id') as NomineeList<DefaultTimeNomination>;
  const { players, vehicles } = getEntities(replayInfo);

  Object.values(players).forEach(({ id: playerId, name: playerName }) => {
    const entity = replayInfo.entities[playerId];

    if (!entity || entity.type === 'vehicle') return;

    const { positions } = entity;
    let timeAlive = 0;
    let timeWalked = 0;
    let timeInVehicle = 0;
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

        timeInVehicle += secondsInFrame;
      }

      timeAlive += secondsInFrame;

      return false;
    });

    const entityName = getPlayerName(playerName)[0];
    const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

    const currentMostTimeAliveNominee = mostTimeAliveNomineesById[id] || {
      id, name, time: defaultTimeDuration, timeInSeconds: 0,
    };
    const currentMostTimeWalkedNominee = mostTimeWalkedNomineesById[id] || {
      id, name, time: defaultTimeDuration, timeInSeconds: 0,
    };
    const currentMostTimeInVehicleNominee = mostTimeInVehicleNomineesById[id] || {
      id, name, time: defaultTimeDuration, timeInSeconds: 0,
    };
    const currentMostTimeInGroundVehicleNominee = mostTimeInGroundVehicleNomineesById[id] || {
      id, name, time: defaultTimeDuration, timeInSeconds: 0,
    };
    const currentMostTimeInFlyingVehicleNominee = mostTimeInFlyingVehicleNomineesById[id] || {
      id, name, time: defaultTimeDuration, timeInSeconds: 0,
    };

    mostTimeAliveNomineesById[id] = {
      id,
      name,
      time: defaultTimeDuration,
      timeInSeconds: currentMostTimeAliveNominee.timeInSeconds + timeAlive,
    };
    mostTimeWalkedNomineesById[id] = {
      id,
      name,
      time: defaultTimeDuration,
      timeInSeconds: currentMostTimeWalkedNominee.timeInSeconds + timeWalked,
    };
    mostTimeInVehicleNomineesById[id] = {
      id,
      name,
      time: defaultTimeDuration,
      timeInSeconds: currentMostTimeInVehicleNominee.timeInSeconds + timeInVehicle,
    };
    mostTimeInGroundVehicleNomineesById[id] = {
      id,
      name,
      time: defaultTimeDuration,
      timeInSeconds: currentMostTimeInGroundVehicleNominee.timeInSeconds + timeInGroundVehicle,
    };
    mostTimeInFlyingVehicleNomineesById[id] = {
      id,
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
      mostTimeAlive: Object.values(mostTimeAliveNomineesById),
      mostTimeWalked: Object.values(mostTimeWalkedNomineesById),
      mostTimeInVehicle: Object.values(mostTimeInVehicleNomineesById),
      mostTimeInGroundVehicle: Object.values(mostTimeInGroundVehicleNomineesById),
      mostTimeInFlyingVehicle: Object.values(mostTimeInFlyingVehicleNomineesById),
    },
  };
};

export default mostTime;
