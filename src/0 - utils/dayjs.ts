import vanillaDayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';

vanillaDayjs.extend(advancedFormat);
vanillaDayjs.extend(customParseFormat);
vanillaDayjs.extend(duration);
vanillaDayjs.extend(isBetween);
vanillaDayjs.extend(isSameOrAfter);
vanillaDayjs.extend(isSameOrBefore);
vanillaDayjs.extend(isoWeek);
vanillaDayjs.extend(timezone);
vanillaDayjs.extend(updateLocale);
vanillaDayjs.extend(utc);
vanillaDayjs.extend(weekOfYear);
vanillaDayjs.extend(weekday);

vanillaDayjs.updateLocale('en', {
  weekStart: 1,
});

export const dayjsUTC = (date?: string, format?: string) => vanillaDayjs.utc(date, format, true);

export const dayjsUnix = (date: number) => vanillaDayjs.unix(date).utc();

export const dayjsUTCISO = (date?: string) => dayjsUTC(date).toISOString();
