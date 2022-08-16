import vanillaDayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isoWeek from 'dayjs/plugin/isoWeek';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekday from 'dayjs/plugin/weekday';

vanillaDayjs.extend(advancedFormat);
vanillaDayjs.extend(isBetween);
vanillaDayjs.extend(isSameOrAfter);
vanillaDayjs.extend(isSameOrBefore);
vanillaDayjs.extend(isoWeek);
vanillaDayjs.extend(updateLocale);
vanillaDayjs.extend(utc);
vanillaDayjs.extend(weekOfYear);
vanillaDayjs.extend(weekday);

vanillaDayjs.updateLocale('en', {
  weekStart: 1,
});

export const dayjsUTC = (date?: string) => vanillaDayjs.utc(date);

export const dayjsUnix = (date: number) => vanillaDayjs.unix(date).utc();
