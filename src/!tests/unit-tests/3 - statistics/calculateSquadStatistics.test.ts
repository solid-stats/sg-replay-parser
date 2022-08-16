/* eslint-disable max-nested-callbacks */
/* eslint-disable @typescript-eslint/no-loop-func */
import * as dayjs from '../../../0 - utils/dayjs';
import calculateGlobalStatistics from '../../../3 - statistics/global';
import calculateSquadStatistics from '../../../3 - statistics/squads';
import parsedReplays, {
  squadStatisticsOnNonWeekend,
  parsedReplaysOnLastFriday,
  squadStatisticsAfterFirstDay,
} from './data/forSquadStatistics';

describe('Calculation of squad statistics on any non-weekend day should return correct and same results', () => {
  let mondayResults: GlobalSquadStatistics[] = [];

  for (let dayNumber = 0; dayNumber < 5; dayNumber += 1) {
    const date = dayjs.dayjsUTC('2022-08-15 12:25:37').weekday(dayNumber);

    it(`Calculations on ${date.format('dddd')} should be correct`, () => {
      const globalStatistics = calculateGlobalStatistics(parsedReplays);

      expect(globalStatistics).toMatchSnapshot();

      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);

      const squadStatistics = calculateSquadStatistics(globalStatistics, parsedReplays);

      if (dayNumber === 0) mondayResults = squadStatistics;

      expect(squadStatistics).toMatchObject(squadStatisticsOnNonWeekend);
      expect(squadStatistics).toMatchObject(mondayResults);
    });
  }
});

describe('Calculation of squad statistics on Friday, after the game, and on Saturday morning should return correct and same results', () => {
  const dates = [dayjs.dayjsUTC('2022-08-19 20:04:23'), dayjs.dayjsUTC('2022-08-20 12:00')];
  const replays = [...parsedReplays, ...parsedReplaysOnLastFriday];
  let statisticsToCompare: GlobalSquadStatistics[] = [];

  dates.forEach((date, index) => {
    it(`Calculations on ${index === 0 ? 'Friday, after the game,' : 'Saturday morning'} should be correct`, () => {
      const globalStatistics = calculateGlobalStatistics(replays);

      expect(globalStatistics).toMatchSnapshot();

      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);

      const squadStatistics = calculateSquadStatistics(globalStatistics, replays);

      if (index === 0) statisticsToCompare = squadStatistics;

      expect(squadStatistics).toMatchObject(squadStatisticsAfterFirstDay);
      expect(squadStatistics).toMatchObject(statisticsToCompare);
    });
  });
});
