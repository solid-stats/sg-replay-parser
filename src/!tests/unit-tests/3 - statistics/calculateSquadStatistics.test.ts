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
  const initialDate = dayjs.dayjsUTC('2022-08-15 12:25:37');
  const rotationStartDate = initialDate.startOf('year');
  let mondayResults: GlobalSquadStatistics[] = [];

  for (let dayNumber = 0; dayNumber < 5; dayNumber += 1) {
    const date = initialDate.weekday(dayNumber);

    it(`Calculations on ${date.format('dddd')} should be correct`, () => {
      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatistics = calculateSquadStatistics(
        parsedReplays,
        rotationStartDate,
        null,
        true,
      );

      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatisticsWithRotationEndDate = calculateSquadStatistics(
        parsedReplays,
        rotationStartDate,
        date,
        true,
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
  const rotationStartDate = dates[0].startOf('year');
  const replays = [...parsedReplays, ...parsedReplaysOnLastFriday];
  let statisticsToCompare: GlobalSquadStatistics[] = [];

  dates.forEach((date, index) => {
    it(`Calculations on ${index === 0 ? 'Friday, after the game,' : 'Saturday morning'} should be correct`, () => {
      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatistics = calculateSquadStatistics(
        replays,
        rotationStartDate,
        null,
        true,
      );

      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatisticsWithRotationEndDate = calculateSquadStatistics(
        replays,
        rotationStartDate,
        date,
        true,
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
  const rotationStartDate = dates[0].startOf('year');
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
      const squadStatistics = calculateSquadStatistics(
        replays,
        rotationStartDate,
        null,
        true,
      );

      jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);
      const squadStatisticsWithRotationEndDate = calculateSquadStatistics(
        replays,
        rotationStartDate,
        date,
        true,
      );

      if (index === 0) statisticsToCompare = squadStatistics;

      expect(squadStatistics).toMatchObject(squadStatisticsAfterGameWeekend);
      expect(squadStatistics).toMatchObject(statisticsToCompare);
      expect(squadStatistics).toMatchObject(squadStatisticsWithRotationEndDate);
    });
  });
});

test('Calculation with empty replays should return nothing', () => {
  const date = dayjs.dayjsUTC('2024-07-15');

  jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);

  const squadStatistics = calculateSquadStatistics(
    [],
    date,
    null,
    true,
  );

  expect(squadStatistics).toHaveLength(0);
});

test('Squads with less than 5 members should not account', () => {
  const initialDate = dayjs.dayjsUTC('2022-08-16').startOf('day');
  const rotationStartDate = initialDate.startOf('year');
  const replays: PlayersGameResult[] = [{
    date: initialDate.toISOString(),
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

  const squadStatistics = calculateSquadStatistics(
    replays,
    rotationStartDate,
    initialDate.add(1, 'day'),
    true,
  );

  expect(squadStatistics).toHaveLength(1);
});

describe(getDefaultTestDescription('Squad statistics with different modes'), () => {
  const getReplays = (date: string): PlayersGameResult => ({
    date,
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r' }),
      generatePlayerInfo({ id: 1, name: '[FNX]Flashback' }),
      generatePlayerInfo({ id: 2, name: '[FNX]Skywalker' }),
      generatePlayerInfo({ id: 3, name: '[FNX]Brom' }),
      generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy' }),
      generatePlayerInfo({ id: 5, name: '[FNX]LOXDOR' }),
      generatePlayerInfo({ id: 6, name: '[FNX]T1m' }),
    ],
  });

  const rotationStartDate = dayjs.dayjsUTC('2024-07-15');

  const beforeRotationReplays: PlayersGameResult[] = [
    getReplays('2024-07-12T18:00:00.000Z'),
    getReplays('2024-07-13T18:00:00.000Z'),
  ];
  const afterRotationReplays: PlayersGameResult[] = [
    getReplays('2024-07-19T18:00:00.000Z'),
    getReplays('2024-07-20T18:00:00.000Z'),
  ];
  const replays = [...beforeRotationReplays, ...afterRotationReplays];

  const dates = [
    dayjs.dayjsUTC('2024-07-28'),

    dayjs.dayjsUTC('2024-07-29'),
    dayjs.dayjsUTC('2024-08-04'),

    dayjs.dayjsUTC('2024-08-05'),
    dayjs.dayjsUTC('2024-08-11'),
    dayjs.dayjsUTC('2024-08-15'),
  ];

  const firstDate = dayjs.dayjsUTC('2024-07-22');

  jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => firstDate);
  prepareNamesWithMock();
  const squadStatics = calculateSquadStatistics(
    replays,
    rotationStartDate,
    null,
    true,
  );

  test('Players should have played 2 games on the first date', () => {
    expect(squadStatics[0].players[0].totalPlayedGames).toBe(2);
  });

  dates.forEach(
    (date) => {
      test(`Squad statistics for ${date.toJSON()} date should return the same result as for ${firstDate.toJSON()} date`, () => {
        jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => date);

        const squadStatisticsForDate = calculateSquadStatistics(
          replays,
          rotationStartDate,
          null,
          true,
        );

        expect(squadStatisticsForDate).toStrictEqual(squadStatics);
      });
    },
  );

  test('Squad statistics for far date should return empty array', () => {
    const farDate = dayjs.dayjsUTC('2024-08-18');

    jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => farDate);

    const squadStatisticsForFarDate = calculateSquadStatistics(
      replays,
      rotationStartDate,
      null,
      true,
    );

    expect(squadStatisticsForFarDate).toStrictEqual([]);
  });

  test('Squad statistics for far date with full rotation mode should return the same result as for the first date', () => {
    const farDate = dayjs.dayjsUTC('2024-08-18');

    jest.spyOn(dayjs, 'dayjsUTC').mockImplementationOnce(() => farDate);

    const squadStatisticsForFarDate = calculateSquadStatistics(
      replays,
      rotationStartDate,
      null,
      false,
    );

    expect(squadStatisticsForFarDate).toStrictEqual(squadStatics);
  });
});
