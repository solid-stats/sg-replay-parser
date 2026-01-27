import dayjs, { Dayjs } from 'dayjs';

import { dateFormat } from './utils/consts';

const moscowDateToUTC = (date: string, format?: string): Dayjs => (
  dayjs(date, format ?? dateFormat).tz('Europe/Moscow', true).utc()
);

export default moscowDateToUTC;
