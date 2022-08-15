import * as dayjs from '../../../0 - utils/dayjs';
import calculateGlobalStatistics from '../../../3 - statistics/global';
import calculateSquadStatistics from '../../../3 - statistics/squads';
import parsedReplays, { squadStatisticsOnNonWeekend } from './data/forSquadStatistics';

test('test', () => {
  const globalStatistics = calculateGlobalStatistics(parsedReplays);

  expect(globalStatistics).toMatchSnapshot();

  // console.log(
  //   JSON.stringify({ globalStatistics, squadStatisticsOnNonWeekend }, null, '\t'),
  // );
  // console.log(JSON.stringify(globalStatistics, null, '\t'));

  const mondayDate = dayjs.dayjsUTC('2022-08-15');

  jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => mondayDate);

  const squadStatistics = calculateSquadStatistics(globalStatistics, parsedReplays);

  expect(squadStatistics).toMatchObject(squadStatisticsOnNonWeekend);
});
