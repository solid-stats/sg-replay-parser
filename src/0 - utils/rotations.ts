import { endOfWeek, startOfWeek, sub } from 'date-fns';

import { dateFnsOptionsWithFirstWeekDate } from '../0 - consts';
import dateToUTC from './utc';

type ReturnType = [startDate: Date, endDate: Date | null];

const startDates: string[] = [
  '2020-09-14T00:00:00.000Z',
  '2021-01-11T00:00:00.000Z',
  '2021-05-31T00:00:00.000Z',
  '2021-11-01T00:00:00.000Z',
  '2022-02-28T00:00:00.000Z',
  '2022-07-04T00:00:00.000Z',
];

const rotationsStartDates: Date[] = startDates.map((startDate) => (
  dateToUTC(
    startOfWeek(
      new Date(startDate),
      dateFnsOptionsWithFirstWeekDate,
    ),
  )
));

const getRotations = (): ReturnType[] => rotationsStartDates.map((startDate, i, arr) => {
  const nextStartDate = arr[i + 1];

  if (!nextStartDate) return [startDate, null];

  const endDate = dateToUTC(endOfWeek(
    sub(nextStartDate, { weeks: 1 }),
    dateFnsOptionsWithFirstWeekDate,
  ));

  return [startDate, endDate];
});

export default getRotations;
