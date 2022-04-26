import { sub } from 'date-fns';

// the start date must be the beginning of the week
const rotationsStartDates: Date[] = [
  new Date(2020, 8, 15),
  new Date(2021, 0, 12),
  new Date(2021, 4, 32),
  new Date(2021, 10, 2),
  new Date(2022, 1, 29),
];

const getRotations = (): Rotation[] => rotationsStartDates.map((startDate, i, arr) => {
  const nextStartDate = arr[i + 1];

  if (!nextStartDate) return [startDate, null];

  const endDate = sub(nextStartDate, { days: 1 });

  return [startDate, endDate];
});

export default getRotations;
