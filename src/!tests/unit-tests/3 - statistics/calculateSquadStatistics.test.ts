/* eslint-disable max-nested-callbacks */
/* eslint-disable @typescript-eslint/no-loop-func */
import * as dayjs from '../../../0 - utils/dayjs';
import calculateSquadStatistics from '../../../3 - statistics/squads';
import generatePlayerInfo from '../../utils/generators/generatePlayerInfo';
import getDefaultTestDescription from '../../utils/getDefaultTestDescription';
import prepareNamesWithMock from '../../utils/prepareNamesWithMock';
import {
  parsedReplays,
  squadStatisticsOnNonWeekend,
  parsedReplaysOnLastFriday,
  squadStatisticsAfterFirstDay,
  parsedReplaysOnLastSaturday,
  squadStatisticsAfterGameWeekend,
} from './data/forSquadStatistics';

beforeAll(() => { prepareNamesWithMock(); });

describe('Calculation of squad statistics on any non-weekend day should return correct and same results', () => {
  let mondayResults: GlobalSquadStatistics[] = [];

  for (let dayNumber = 0; dayNumber < 5; dayNumber += 1) {
    const date = dayjs.dayjsUTC('2022-08-15 12:25:37').weekday(dayNumber);

    it(`Calculations on ${date.format('dddd')} should be correct`, () => {
      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatistics = calculateSquadStatistics(parsedReplays, null);

      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatisticsWithRotationEndDate = calculateSquadStatistics(
        parsedReplays,
        date,
      );

      if (dayNumber === 0) mondayResults = squadStatistics;

      expect(squadStatistics).toMatchObject(squadStatisticsOnNonWeekend);
      expect(squadStatistics).toMatchObject(mondayResults);
      expect(squadStatistics).toMatchObject(squadStatisticsWithRotationEndDate);
    });
  }
});

describe('Calculation of squad statistics on Friday, after the game, and on Saturday morning should return correct and same results', () => {
  const dates = [dayjs.dayjsUTC('2022-08-19 20:04:23'), dayjs.dayjsUTC('2022-08-20 12:00')];
  const replays = [...parsedReplays, ...parsedReplaysOnLastFriday];
  let statisticsToCompare: GlobalSquadStatistics[] = [];

  dates.forEach((date, index) => {
    it(`Calculations on ${index === 0 ? 'Friday, after the game,' : 'Saturday morning'} should be correct`, () => {
      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatistics = calculateSquadStatistics(replays, null);

      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatisticsWithRotationEndDate = calculateSquadStatistics(
        replays,
        date,
      );

      if (index === 0) statisticsToCompare = squadStatistics;

      expect(squadStatistics).toMatchObject(squadStatisticsAfterFirstDay);
      expect(squadStatistics).toMatchObject(statisticsToCompare);
      expect(squadStatistics).toMatchObject(squadStatisticsWithRotationEndDate);
    });
  });
});

describe('Calculation of squad statistics on Saturday, after the game, on Sunday morning and evening, and on next day should return correct and same results', () => {
  const dates = [
    dayjs.dayjsUTC('2022-08-20 20:04:23'),
    dayjs.dayjsUTC('2022-08-21 10:00'),
    dayjs.dayjsUTC('2022-08-21').endOf('day'),
    dayjs.dayjsUTC('2022-08-22 10:00'),
  ];
  const replays = [
    ...parsedReplays,
    ...parsedReplaysOnLastFriday,
    ...parsedReplaysOnLastSaturday,
  ];
  let statisticsToCompare: GlobalSquadStatistics[] = [];

  dates.forEach((date, index) => {
    let dayText = 'Saturday, after the game,';

    switch (index) {
      case 1: dayText = 'Sunday morning';
        break;
      case 2: dayText = 'Sunday evening';
        break;
      case 3: dayText = 'Next day';
        break;
      default:
        dayText = 'Saturday, after the game,';
        break;
    }

    it(`Calculations on ${dayText} should be correct`, () => {
      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatistics = calculateSquadStatistics(replays, null);

      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatisticsWithRotationEndDate = calculateSquadStatistics(
        replays,
        date,
      );

      if (index === 0) statisticsToCompare = squadStatistics;

      expect(squadStatistics).toMatchObject(squadStatisticsAfterGameWeekend);
      expect(squadStatistics).toMatchObject(statisticsToCompare);
      expect(squadStatistics).toMatchObject(squadStatisticsWithRotationEndDate);
    });
  });
});

test('Calculation with empty replays should return nothing', () => {
  const squadStatistics = calculateSquadStatistics([], null);

  expect(squadStatistics).toHaveLength(0);
});

test('Squads with less than 5 members should not account', () => {
  const replays: PlayersGameResult[] = [{
    date: dayjs.dayjsUTC('2022-08-16').startOf('day').toISOString(),
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[HH]smth1' }),

      generatePlayerInfo({ id: 1, name: '[FNX]smth2' }),
      generatePlayerInfo({ id: 2, name: '[FNX]smth3' }),
      generatePlayerInfo({ id: 3, name: '[FNX]smth4' }),
      generatePlayerInfo({ id: 4, name: '[FNX]smth5' }),
      generatePlayerInfo({ id: 5, name: '[FNX]smth6' }),
    ],
  }];

  const squadStatistics = calculateSquadStatistics(replays, dayjs.dayjsUTC('2022-08-20'));

  expect(squadStatistics).toHaveLength(1);
});

test(getDefaultTestDescription('Calculation of squad statistics with rotationEndDate parameter'), () => {
  const date = dayjs.dayjsUTC('2023-08-15');
  const rotationEndDate = dayjs.dayjsUTC('2022-08-15').endOf('day');

  jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);

  const squadStatistics = calculateSquadStatistics(
    parsedReplays,
    rotationEndDate,
  );

  expect(squadStatistics).toMatchObject(squadStatisticsOnNonWeekend);
});
