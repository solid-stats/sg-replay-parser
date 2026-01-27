import syncParse from 'csv-parse/sync';

import calculateGlobalStatistics from '..';
import { getNamesList } from '../../../../shared/utils/namesHelper';
import { prepareNamesList } from '../../../../shared/utils/namesHelper/prepareNamesList';
import generateNameChangeItem from '../../../../shared/testing/generators/generateNameChangeItem';
import {
  nameChangeAndChangeBackTestData,
  nameChangeAndChangeBackWithCollisionsTestData,
  nameChangesSequenceTestData,
  nameChangesTestData,
  otherPlayersStatisticsWithNameChangesTestData,
} from '../data/forGlobalStatisticsWithNameChanges';

const exampleNamesChanges = [
  generateNameChangeItem('Parker', 'morpex', '12.11.2022 6:21'),
  generateNameChangeItem('morpex', 'Parker', '26.12.2022 22:01'),

  generateNameChangeItem('Markovnik', 'borigen', '09.04.2023 1:03'),

  generateNameChangeItem('callisto1', 'Outkast', '20.12.2022 15:45'),
  generateNameChangeItem('Outkast', 'kanistra', '30.06.2023 11:29'),
  generateNameChangeItem('kanistra', 'AllCash', '01.09.2023 13:22'),

  generateNameChangeItem('neon', 'beda', '03.02.2023 5:05'),
  generateNameChangeItem('Londor', 'neon', '03.03.2023 5:05'),
  generateNameChangeItem('neon', 'londor', '03.04.2023 5:05'),
  generateNameChangeItem('beda', 'neon', '03.05.2023 5:05'),
];

jest.mock('uuid', () => {
  let id = 0;

  return {
    v4: () => {
      const oldId = id;

      id += 1;

      return oldId.toString();
    },
  };
});
jest.mock('csv-parse');
jest.spyOn(syncParse, 'parse').mockReturnValue(exampleNamesChanges);
prepareNamesList();

test('Prepare names changes list snapshot', () => {
  const namesList = getNamesList();

  expect(namesList).toMatchSnapshot();
});

describe('getPlayerId func should work correctly', () => {
  it('Name change should work correctly', () => {
    const playersGameResult = nameChangesTestData;

    const resultGlobalStatistics = calculateGlobalStatistics(playersGameResult);

    expect(resultGlobalStatistics).toMatchSnapshot();
  });

  it('Name changes sequence should work correctly', () => {
    const playersGameResult = nameChangesSequenceTestData;

    const resultGlobalStatistics = calculateGlobalStatistics(playersGameResult);

    expect(resultGlobalStatistics).toMatchSnapshot();
  });

  it('Name change and then change back to the same name should work correctly', () => {
    const playersGameResult = nameChangeAndChangeBackTestData;

    const resultGlobalStatistics = calculateGlobalStatistics(playersGameResult);

    expect(resultGlobalStatistics).toMatchSnapshot();
  });

  it('Name change collision after name change and before change back should be handled correctly', () => {
    const playersGameResult = nameChangeAndChangeBackWithCollisionsTestData;

    const resultGlobalStatistics = calculateGlobalStatistics(playersGameResult);

    expect(resultGlobalStatistics).toMatchSnapshot();
  });

  it('Other players statistics calculation should work correctly', () => {
    const playersGameResult = otherPlayersStatisticsWithNameChangesTestData();

    const resultGlobalStatistics = calculateGlobalStatistics(playersGameResult);

    expect(resultGlobalStatistics).toMatchSnapshot();
  });
});
