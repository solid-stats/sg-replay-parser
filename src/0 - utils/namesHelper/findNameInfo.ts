import { Dayjs } from 'dayjs';

import { dayjsUTC } from '../dayjs';
import { isInInterval } from '../isInInterval';
import { dateFormat } from './utils/consts';
import { NameInfo, NamesList } from './utils/types';

// examples:
// afgan0r_0 -> 0
// afgan0r_1 -> 1
const getIndexFromName = (name: string) => Number(name.split('_')[1]);

type ReturnType = {
  info: NameInfo,
  indexInfo: { listIndex: number, lastIndex: number },
};

export const findNameInfo = (
  namesList: NamesList,
  playerName: PlayerName,
  date: Dayjs,
): ReturnType | undefined => {
  const names = Object.keys(namesList).filter((name) => name.includes(playerName));

  const index = names.findIndex((name) => {
    const nameInfo = namesList[name];

    return isInInterval(
      date,
      dayjsUTC(nameInfo.fromDate, dateFormat),
      dayjsUTC(nameInfo.endDate, dateFormat),
      true,
    );
  });

  if (index === -1) {
    const info = namesList[`${playerName}_0`];

    if (
      info && isInInterval(
        date,
        dayjsUTC(info.fromDate, dateFormat),
        dayjsUTC(info.endDate, dateFormat),
        true,
      )
    ) return { info, indexInfo: { listIndex: 0, lastIndex: 0 } };

    return undefined;
  }

  return {
    info: namesList[names[index]],
    indexInfo: {
      listIndex: index,
      lastIndex: getIndexFromName(names[names.length - 1]),
    },
  };
};
