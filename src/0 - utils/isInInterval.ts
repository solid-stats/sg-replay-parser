import { Dayjs } from 'dayjs';

export const isInInterval = (date: Dayjs, startDate: Dayjs, endDate: Dayjs): boolean => (
  date.isBetween(startDate, endDate, 'ms', '[)')
);
