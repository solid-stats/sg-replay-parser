import { Dayjs } from 'dayjs';

export const isInInterval = (date: Dayjs, startDate: Dayjs, endDate: Dayjs, excludeEndDate?: boolean): boolean => (
  date.isBetween(startDate, endDate, 'ms', excludeEndDate ? '[)' : '[]')
);
