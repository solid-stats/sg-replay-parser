import { Dayjs } from 'dayjs';

import { dayjsUTC } from './dayjs';

type ReturnType = [startDate: Dayjs, endDate: Dayjs | null];

const startDates: string[] = [
  '2020-09-14T00:00:00.000Z',
  '2021-01-11T00:00:00.000Z',
  '2021-05-31T00:00:00.000Z',
  '2021-11-01T00:00:00.000Z',
  '2022-02-28T00:00:00.000Z',
  '2022-07-04T00:00:00.000Z',
  '2022-10-03T00:00:00.000Z',
  '2023-01-09T00:00:00.000Z',
  '2023-04-03T00:00:00.000Z',
  '2023-07-03T00:00:00.000Z',
  '2023-10-02T00:00:00.000Z',
  '2024-04-08T00:00:00.000Z',
  '2024-07-01T00:00:00.000Z',
  '2024-10-01T00:00:00.000Z',
];

const rotationsStartDates: Dayjs[] = startDates.map((startDate) => (
  dayjsUTC(startDate).startOf('isoWeek')
));

const getRotations = (): ReturnType[] => rotationsStartDates.map((startDate, i, arr) => {
  const nextStartDate = arr[i + 1];

  if (!nextStartDate) return [startDate, null];

  const endDate = nextStartDate.subtract(1, 'day').endOf('day');

  return [startDate, endDate];
});

export default getRotations;
