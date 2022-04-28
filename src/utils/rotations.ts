import { sub } from 'date-fns';

// the start date must be the beginning of the week
const rotationsStartDates: Date[] = [
  new Date(2020, 8, 14),
  new Date(2021, 0, 11),
  new Date(2021, 4, 31),
  new Date(2021, 10, 1),
  new Date(2022, 1, 28),
];

const getRotations = (): Rotation[] => rotationsStartDates.map((startDate, i, arr) => {
  const nextStartDate = arr[i + 1];

  if (!nextStartDate) return [startDate, null];

  const endDate = sub(nextStartDate, { days: 1 });

  return [startDate, endDate];
});

export default getRotations;
