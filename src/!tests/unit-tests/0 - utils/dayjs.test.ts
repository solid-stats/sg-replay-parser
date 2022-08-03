import { dayjsUnix, dayjsUTC } from '../../../0 - utils/dayjs';
import { DayjsInterval } from '../../../3 - statistics/squads/types';
import { isInInterval } from '../../../3 - statistics/squads/utils';

const testFormat = 'YYYY-MM-DDTHH:mm:ss ZZ';

test('Dayjs should correct parse dates', () => {
  const date = '2022-07-23T19:05:12.000Z';
  const unix = 1658525118;

  expect(dayjsUTC(date).format(testFormat)).toEqual('2022-07-23T19:05:12 +0000');
  expect(dayjsUnix(unix).format(testFormat)).toEqual('2022-07-22T21:25:18 +0000');
});

test('Dayjs should return correct week number', () => {
  // 2020 - 2021 transition
  expect(dayjsUTC('2020-12-24').format('GGGG-WW')).toEqual('2020-52');
  expect(dayjsUTC('2020-12-30').format('GGGG-WW')).toEqual('2020-53');
  expect(dayjsUTC('2021-01-01').format('GGGG-WW')).toEqual('2020-53');
  expect(dayjsUTC('2021-01-04').format('GGGG-WW')).toEqual('2021-01');
  expect(dayjsUTC('2021-01-13').format('GGGG-WW')).toEqual('2021-02');

  // 2021 - 2022 transition
  expect(dayjsUTC('2021-12-24').format('GGGG-WW')).toEqual('2021-51');
  expect(dayjsUTC('2021-12-30').format('GGGG-WW')).toEqual('2021-52');
  expect(dayjsUTC('2022-01-01').format('GGGG-WW')).toEqual('2021-52');
  expect(dayjsUTC('2022-01-03').format('GGGG-WW')).toEqual('2022-01');
  expect(dayjsUTC('2022-01-12').format('GGGG-WW')).toEqual('2022-02');

  // 2022 - 2023 transition
  expect(dayjsUTC('2022-12-24').format('GGGG-WW')).toEqual('2022-51');
  expect(dayjsUTC('2022-12-30').format('GGGG-WW')).toEqual('2022-52');
  expect(dayjsUTC('2023-01-01').format('GGGG-WW')).toEqual('2022-52');
  expect(dayjsUTC('2023-01-02').format('GGGG-WW')).toEqual('2023-01');
  expect(dayjsUTC('2023-01-10').format('GGGG-WW')).toEqual('2023-02');

  // random dates in each year
  expect(dayjsUTC('2020-04-13').format('GGGG-WW')).toEqual('2020-16');
  expect(dayjsUTC('2021-02-01').format('GGGG-WW')).toEqual('2021-05');
  expect(dayjsUTC('2022-11-21').format('GGGG-WW')).toEqual('2022-47');
});

test('Dayjs should return correct start and end of the week', () => {
  expect(dayjsUTC('2022-08-07T23:59:59.999Z').startOf('isoWeek').format(testFormat)).toEqual('2022-08-01T00:00:00 +0000');
  expect(dayjsUTC('2022-08-07T23:59:59.999Z').endOf('isoWeek').format(testFormat)).toEqual('2022-08-07T23:59:59 +0000');

  expect(dayjsUTC('2022-01-01T23:59:59.999Z').startOf('isoWeek').format(testFormat)).toEqual('2021-12-27T00:00:00 +0000');
  expect(dayjsUTC('2022-01-01T23:59:59.999Z').endOf('isoWeek').format(testFormat)).toEqual('2022-01-02T23:59:59 +0000');
  expect(dayjsUTC('2022-01-03T23:59:59.999Z').startOf('isoWeek').format(testFormat)).toEqual('2022-01-03T00:00:00 +0000');
  expect(dayjsUTC('2022-01-03T23:59:59.999Z').endOf('isoWeek').format(testFormat)).toEqual('2022-01-09T23:59:59 +0000');
});

test('isBetween should work correct', () => {
  const currentDate = dayjsUTC('2022-08-05T17:23:15.125Z');

  const interval: DayjsInterval = [
    currentDate.startOf('isoWeek'),
    currentDate.endOf('isoWeek'),
  ];

  const correctDays = [
    dayjsUTC('2022-08-01'),
    dayjsUTC('2022-08-03'),
    dayjsUTC('2022-08-07'),
  ];
  const wrongDates = [
    dayjsUTC('2022-07-21'),
    dayjsUTC('2022-08-08'),
    dayjsUTC('2022-08-13'),
    dayjsUTC('2022-01-01'),
  ];

  const datesToTest = [
    ...correctDays,
    ...wrongDates,
  ];

  expect(
    datesToTest.filter((date) => isInInterval(date.toISOString(), interval)),
  ).toStrictEqual(correctDays);
});
