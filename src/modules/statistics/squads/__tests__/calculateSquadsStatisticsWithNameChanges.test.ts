import syncParse from 'csv-parse/sync';

import calculateSquadStatistics from '..';
import { dayjsUTC } from '../../../../shared/utils/dayjs';
import { getNamesList } from '../../../../shared/utils/namesHelper';
import { prepareNamesList } from '../../../../shared/utils/namesHelper/prepareNamesList';
import generateNameChangeItem from '../../../../shared/testing/generators/generateNameChangeItem';
import {
  nameChangeAfterSquadChangeTestData,
  nameChangeAndChangeBackTestData,
  nameChangeAndChangeBackWithCollisionsTestData,
  nameChangesSequenceTestData,
  nameChangesTestData,
} from '../data/forSquadStatisticsWithNameChanges';

const exampleNamesChanges = [
  generateNameChangeItem('Parker', 'morpex', '12.11.2022 3:00'),
  generateNameChangeItem('morpex', 'Parker', '15.11.2022 3:00'),

  generateNameChangeItem('Markovnik', 'borigen', '09.04.2023 3:00'),

  generateNameChangeItem('callisto1', 'Outkast', '18.08.2023 3:00'),
  generateNameChangeItem('Outkast', 'kanistra', '25.08.2023 3:00'),
  generateNameChangeItem('kanistra', 'AllCash', '01.09.2023 3:00'),

  generateNameChangeItem('neon', 'beda', '05.08.2023 3:00'),
  generateNameChangeItem('Londor', 'neon', '05.08.2023 4:00'),
  generateNameChangeItem('neon', 'londor', '07.08.2023 3:00'),
  generateNameChangeItem('beda', 'neon', '08.08.2023 3:00'),
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
    const rotationStartDate = dayjsUTC(playersGameResult[0].date).startOf('week');

    const resultSquadStatistics = calculateSquadStatistics(
      playersGameResult,
      rotationStartDate,
      dayjsUTC('2023-04-15'),
      true,
    );

    expect(resultSquadStatistics).toMatchSnapshot();
  });

  it('Name changes sequence should work correctly', () => {
    const playersGameResult = nameChangesSequenceTestData;
    const rotationStartDate = dayjsUTC(playersGameResult[0].date).startOf('week');

    const resultSquadStatistics = calculateSquadStatistics(
      playersGameResult,
      rotationStartDate,
      dayjsUTC('2023-09-02'),
      true,
    );

    expect(resultSquadStatistics).toMatchSnapshot();
  });

  it('Name change and then change back to the same name should work correctly', () => {
    const playersGameResult = nameChangeAndChangeBackTestData;
    const rotationStartDate = dayjsUTC(playersGameResult[0].date).startOf('week');

    const resultSquadStatistics = calculateSquadStatistics(
      playersGameResult,
      rotationStartDate,
      dayjsUTC('2022-11-19'),
      true,
    );

    expect(resultSquadStatistics).toMatchSnapshot();
  });

  it('Name change collision after name change and before change back should be handled correctly', () => {
    const playersGameResult = nameChangeAndChangeBackWithCollisionsTestData;
    const rotationStartDate = dayjsUTC(playersGameResult[0].date).startOf('week');

    const resultSquadStatistics = calculateSquadStatistics(
      playersGameResult,
      rotationStartDate,
      dayjsUTC('2023-08-12'),
      true,
    );

    expect(resultSquadStatistics).toMatchSnapshot();
  });

  it('Name change after squad change should be handled correctly', () => {
    const playersGameResult = nameChangeAfterSquadChangeTestData;
    const rotationStartDate = dayjsUTC(playersGameResult[0].date).startOf('week');

    const resultSquadStatistics = calculateSquadStatistics(
      playersGameResult,
      rotationStartDate,
      dayjsUTC('2023-04-15'),
      true,
    );

    expect(resultSquadStatistics).toMatchSnapshot();
  });
});
