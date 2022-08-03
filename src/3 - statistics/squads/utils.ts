import { dayjsUTC } from '../../0 - utils/dayjs';
import { DayjsInterval } from './types';

// eslint-disable-next-line import/prefer-default-export
export const isInInterval = (date: string, interval: DayjsInterval): boolean => (
  dayjsUTC(date).isBetween(interval[0], interval[1], 'ms', '[]')
);
