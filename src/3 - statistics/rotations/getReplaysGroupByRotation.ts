import { isAfter, isBefore, isEqual } from 'date-fns';
import remove from 'lodash/remove';

import getRotations from '../../0 - utils/rotations';

const getReplaysGroupByRotation = (replays: PlayersGameResult[]) => {
  const rotations = getRotations();
  const replaysCopy = replays.slice();
  const replaysGroupedByRotation = rotations.map((rotationDates) => {
    const [startDate, endDate] = rotationDates;

    const rotationReplays = remove(replaysCopy, (replay) => {
      if (!endDate) {
        return isAfter(replay.date, startDate) || isEqual(startDate, replay.date);
      }

      return (
        (isAfter(replay.date, startDate) || isEqual(startDate, replay.date))
        && (isBefore(replay.date, endDate) || isEqual(endDate, replay.date))
      );
    });

    return rotationReplays;
  });

  return replaysGroupedByRotation;
};

export default getReplaysGroupByRotation;
