import vanillaDayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import duration from 'dayjs/plugin/duration.js';
import isBetween from 'dayjs/plugin/isBetween.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js';
import isoWeek from 'dayjs/plugin/isoWeek.js';
import timezone from 'dayjs/plugin/timezone.js';
import updateLocale from 'dayjs/plugin/updateLocale.js';
import utc from 'dayjs/plugin/utc.js';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
import weekday from 'dayjs/plugin/weekday.js';

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
