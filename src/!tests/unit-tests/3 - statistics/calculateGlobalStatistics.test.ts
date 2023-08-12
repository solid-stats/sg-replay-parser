import fs from 'fs';

import { dayjsUTCISO } from '../../../0 - utils/dayjs';
import calculateGlobalStatistics from '../../../3 - statistics/global';
import generatePlayerInfo from '../../utils/generators/generatePlayerInfo';
import getDefaultTestDescription from '../../utils/getDefaultTestDescription';
import prepareNamesWithMock from '../../utils/prepareNamesWithMock';
import data from './data/forGlobalStatistics';

beforeAll(() => { prepareNamesWithMock(); });

it(getDefaultTestDescription('Global statistics calculation'), () => {
  const { globalStatistics, playersGameResult } = data;

  const resultGlobalStatistics = calculateGlobalStatistics(playersGameResult);

  expect(resultGlobalStatistics).toMatchObject(globalStatistics);
});

jest.mock('fs');

it('Exception in readExcludePlayer function should handled correctly', () => {
  const { globalStatistics, playersGameResult } = data;

  jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
    throw new Error();
  });

  const resultGlobalStatistics = calculateGlobalStatistics(playersGameResult);

  expect(resultGlobalStatistics).toMatchObject(globalStatistics);
});

it('Exclude players should work correctly', () => {
  const excludePlayers: ConfigExcludePlayer[] = [
    {
      name: 'aFgan0r',
      minDate: dayjsUTCISO('2022-11-28'),
      maxDate: dayjsUTCISO('2022-12-04'),
    },
    {
      name: 'Chikon',
      minDate: dayjsUTCISO('2022-11-28'),
      maxDate: dayjsUTCISO('2022-12-04'),
    },
    {
      name: 'Londor',
      minDate: null,
      maxDate: dayjsUTCISO('2022-12-04'),
    },
    {
      name: 'Markovnik',
      minDate: dayjsUTCISO('2022-12-10'),
      maxDate: null,
    },
  ];
  const playersGameResult: PlayersGameResult[] = [
    {
      date: '2022-12-03',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r' }),
        generatePlayerInfo({ id: 1, name: '[A]Chikon' }),
        generatePlayerInfo({ id: 2, name: '[A]Markovnik' }),
        generatePlayerInfo({ id: 3, name: '[FNX]Londor' }),
      ],
    },
    {
      date: '2022-12-04',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r' }),
        generatePlayerInfo({ id: 1, name: '[A]Chikon' }),
        generatePlayerInfo({ id: 2, name: '[A]Markovnik' }),
        generatePlayerInfo({ id: 3, name: '[FNX]Londor' }),
      ],
    },
    {
      date: '2022-12-10',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r' }),
        generatePlayerInfo({ id: 1, name: '[A]Markovnik' }),
        generatePlayerInfo({ id: 2, name: '[FNX]Londor' }),
      ],
    },
  ];

  jest.spyOn(fs, 'readFileSync').mockImplementation(() => JSON.stringify(excludePlayers));

  const resultGlobalStatistics = calculateGlobalStatistics(playersGameResult);

  expect(resultGlobalStatistics).toHaveLength(3);

  // Markovnik
  expect(resultGlobalStatistics[0].totalPlayedGames).toBe(2);
  // Afgan0r
  expect(resultGlobalStatistics[1].totalPlayedGames).toBe(1);
  // Londor
  expect(resultGlobalStatistics[2].totalPlayedGames).toBe(1);
});
