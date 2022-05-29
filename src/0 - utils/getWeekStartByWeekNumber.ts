import { addWeeks, getWeek, startOfWeek } from 'date-fns';

import { dateFnsOptions, dateFnsOptionsWithFirstWeekDate } from '../0 - consts';

// example of input:
// 2022-35
// which is 2022.08.29 - 2022.09.04
// so output should be 2022-08-29
const getWeekStartByWeekNumber = (weekOfYear: GlobalPlayerWeekStatistics['week']): Date => {
  const [yearString, weekString] = weekOfYear.split('-');

  const year = Number(yearString);
  const week = Number(weekString);
  const firstDateOfYear = new Date(year, 0, 1);

  const isFirstDateInFirstWeek = getWeek(firstDateOfYear, dateFnsOptionsWithFirstWeekDate) === 1;
  const weeksToAdd = isFirstDateInFirstWeek ? week - 1 : week;

  return startOfWeek(addWeeks(firstDateOfYear, weeksToAdd), dateFnsOptions);
};

export default getWeekStartByWeekNumber;
