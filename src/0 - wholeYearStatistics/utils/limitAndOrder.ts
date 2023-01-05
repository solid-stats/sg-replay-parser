import { orderBy, take } from 'lodash';

import { maxRecords } from './consts';

const limitAndOrder = <ListType>(
  list: NomineeList<ListType> | ListType[],
  order: Parameters<typeof orderBy>[1],
  direction: Parameters<typeof orderBy>[2],
  maxValues: number = maxRecords,
): ListType[] => (
    take(
      orderBy(list, order, direction),
      maxValues,
    )
  );

export default limitAndOrder;
