import getPlayerName from '../../0 - utils/getPlayerName';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import calculateDistance from '../utils/calculateDistance';
import { defaultTimeDuration, groundVehicle, secondsInFrame } from '../utils/consts';
import formatTime from '../utils/formatTime';
import limitAndOrder from '../utils/limitAndOrder';

const minHeight = 25;

export const sortMostTimeFlyingInGroundVehicle = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostFlyingTimeInGroundVehicle: limitAndOrder(statistics.mostFlyingTimeInGroundVehicle, 'timeInSeconds', 'desc', 200),
});

export const processMostTimeFlyingInGroundVehicle = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostFlyingTimeInGroundVehicle: statistics.mostFlyingTimeInGroundVehicle.map((nominee) => ({
    ...nominee, time: formatTime(nominee.timeInSeconds),
  })),
});

const mostTimeFlyingInGroundVehicle = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nominees = [...result.mostFlyingTimeInGroundVehicle];
  const { players, vehicles } = getEntities(replayInfo);

  // We use `some` because `return true` will stop processing the array
  // because if the vehicle is destroyed or has wrong class, than we don't need to process it
  // More here: https://stackoverflow.com/questions/2641347/short-circuit-array-foreach-like-calling-break
  Object.values(vehicles).some(({ id: vehicleId, class: vehicleClass, name: vehicleName }) => {
    const entity = replayInfo.entities[vehicleId];

    if (
      !entity
      || !groundVehicle.includes(vehicleClass)
      || entity.type === 'unit'
    ) return true;

    const entityPositions = entity.positions;

    let maximumFliedTime = 0;
    let maximumFliedDistance = 0;
    let maximumFliedPlayerId = 0;
    let maxHeight = 0;
    let startFrame = 0;

    let currentFliedTime = 0;
    let currentFlyingDistance = 0;
    let currentPlayerId = 0;
    let currentMaxHeight = 0;
    let currentStartFrame = 0;

    entityPositions.some((posInfo, frame) => {
      if (frame === 0) return false;

      const [pos, , isVehicleAlive, playerInside] = posInfo;
      const [prevPos] = entityPositions[frame - 1];

      const [, , height] = pos;
      const [, , prevHeight] = prevPos;

      if (!isVehicleAlive) return true;

      // prev and current frame not flying
      if (prevHeight < minHeight && height < minHeight) return false;

      // started flying in current frame
      if (prevHeight < minHeight && height >= minHeight) {
        currentFliedTime = secondsInFrame;
        currentFlyingDistance = calculateDistance(pos, prevPos);
        [currentPlayerId] = playerInside;
        currentMaxHeight = height;
        currentStartFrame = frame;

        return false;
      }

      // flying continued
      if (prevHeight >= minHeight && height >= minHeight) {
        currentFliedTime += secondsInFrame;
        currentFlyingDistance += calculateDistance(pos, prevPos);
        currentMaxHeight = height > currentMaxHeight ? height : currentMaxHeight;

        return false;
      }

      // flying stopped in current frame
      if (prevHeight >= minHeight && height < minHeight) {
        const totalFliedTime = currentFliedTime + secondsInFrame;

        if (totalFliedTime > maximumFliedTime) {
          maximumFliedTime = totalFliedTime;
          maximumFliedDistance = currentFlyingDistance + calculateDistance(pos, prevPos);
          maximumFliedPlayerId = currentPlayerId;
          maxHeight = currentMaxHeight;
          startFrame = currentStartFrame;
        }
      }

      return false;
    });

    if (maximumFliedTime === 0 || startFrame === 0) return false;

    const playerInfo = players[maximumFliedPlayerId];

    if (!playerInfo) return false;

    const name = getPlayerName(playerInfo.name)[0];

    nominees.push({
      name,
      time: defaultTimeDuration,
      timeInSeconds: maximumFliedTime,
      distance: maximumFliedDistance,
      vehicleName,
      maxHeight,
      replayLink: `https://sg.zone${other.replay.replayLink}`,
      startTime: formatTime(startFrame * secondsInFrame),
    });

    return false;
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostFlyingTimeInGroundVehicle: nominees,
    },
  };
};

export default mostTimeFlyingInGroundVehicle;
