import dayjs, { Dayjs } from 'dayjs';

import { dateFormat } from './utils/consts';

const moscowDateToUTC = (date: string): Dayjs => (
  dayjs(date, dateFormat).tz('Europe/Moscow', true).utc()
);

export default moscowDateToUTC;
