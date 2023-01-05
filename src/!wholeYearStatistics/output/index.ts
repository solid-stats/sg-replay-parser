import fs from 'fs';

import { isArray } from 'lodash';

import { statsFolder } from '../../4 - output/consts';
import { nominationsOrder } from '../utils/consts';

const print = (
  statistics: WholeYearStatisticsResult,
  nomination: YearStatisticsKeys,
  orderNumber: number,
): void => (
  fs.appendFileSync(
    `${statsFolder}/${orderNumber} nomination.txt`,
    `${JSON.stringify(statistics[nomination], null, '\t')}\n`,
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
