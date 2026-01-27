import { cloneDeep, remove } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getRotations from '../../../shared/utils/rotations';

const getReplaysGroupByRotation = (replays: PlayersGameResult[]) => {
  const rotations = getRotations();
  const replaysCopy = cloneDeep(replays);
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
