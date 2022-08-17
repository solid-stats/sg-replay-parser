import remove from 'lodash/remove';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getRotations from '../../0 - utils/rotations';

const getReplaysGroupByRotation = (replays: PlayersGameResult[]) => {
  const rotations = getRotations();
  const replaysCopy = replays.slice();
  const replaysGroupedByRotation = rotations.map((rotationDates) => {
    const [startDate, endDate] = rotationDates;

    const rotationReplays = remove(replaysCopy, (replay) => {
      const replayDate = dayjsUTC(replay.date);

      if (!endDate) {
        return replayDate.isSameOrAfter(startDate);
      }

      return replayDate.isSameOrAfter(startDate) && replayDate.isSameOrBefore(endDate);
    });

    return rotationReplays;
  });

  return replaysGroupedByRotation;
};

export default getReplaysGroupByRotation;
