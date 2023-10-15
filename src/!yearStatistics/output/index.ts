import fs from 'fs-extra';

import { isArray } from 'lodash';

import { yearResultsDir } from '../../0 - utils/dirs';
import { nominationsOrder } from '../utils/consts';
import formatters from './formattersList';

const print = (
  statistics: WholeYearStatisticsResult,
  nomination: YearStatisticsKeys,
  orderNumber: number,
): void => (
  fs.appendFileSync(
    `${yearResultsDir}/${orderNumber} nomination.txt`,
    `${formatters[nomination](statistics)}\n`,
  )
);

const printOutput = (statistics: WholeYearStatisticsResult): void => (
  nominationsOrder.forEach((order, index) => {
    const orderNumber = index + 1;

    if (isArray(order)) {
      order.forEach((nomination) => print(statistics, nomination, orderNumber));

      return;
    }

    const nomination = order;

    print(statistics, nomination, orderNumber);
  })
);

export default printOutput;
