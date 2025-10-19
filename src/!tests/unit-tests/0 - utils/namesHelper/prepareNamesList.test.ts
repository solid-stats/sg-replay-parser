import syncParse from 'csv-parse/sync';

import { getNamesList, resetNamesList } from '../../../../0 - utils/namesHelper';
import { prepareNamesList } from '../../../../0 - utils/namesHelper/prepareNamesList';
import { NamesList } from '../../../../0 - utils/namesHelper/utils/types';
import generateNameChangeItem from '../../../utils/generators/generateNameChangeItem';

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

beforeEach(() => { resetNamesList(); });

const getUniqueIds = (namesList: NamesList | null): number => {
  if (!namesList) return 0;

  const existingIds: string[] = [];

  return Object.values(namesList).reduce<number>(
    (count, { id }) => {
      if (existingIds.includes(id)) {
        return count;
      }

      existingIds.push(id);

      return count + 1;
    },
    0,
  );
};

test('Common', () => {
  jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
    generateNameChangeItem('Markovnik', 'borigen', '09.04.2023 3:00'),

    generateNameChangeItem('callisto1', 'Outkast', '18.08.2023 3:00'),
    generateNameChangeItem('Outkast', 'kanistra', '25.08.2023 3:00'),
    generateNameChangeItem('kanistra', 'AllCash', '01.09.2023 3:00'),

    generateNameChangeItem('Dinosavrik', 'Tomahawk', '07.04.2024 17:05'),
    generateNameChangeItem('Tomahawk', 'D1no', '12.10.2024 21:22'),
    generateNameChangeItem('D1no', 'L1iD', '21.10.2024 3:00'),
  ]);

  prepareNamesList();
  const namesList = getNamesList();
  const uniqueIds = getUniqueIds(namesList);

  expect(uniqueIds).toBe(3);
});

test('Back and fourth', () => {
  jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
    generateNameChangeItem('Parker', 'morpex', '12.11.2022 3:00'),
    generateNameChangeItem('morpex', 'Parker', '15.11.2022 3:00'),
  ]);

  prepareNamesList();
  const namesList = getNamesList();
  const uniqueIds = getUniqueIds(namesList);

  expect(uniqueIds).toBe(1);
});

test('Name collisions between different players', () => {
  jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
    // First player
    generateNameChangeItem('neon', 'beda', '05.08.2023 3:00'),
    generateNameChangeItem('Londor', 'neon', '05.08.2023 3:00'),
    generateNameChangeItem('neon', 'londor', '07.08.2023 3:00'),

    // Second player
    generateNameChangeItem('beda', 'neon', '08.08.2023 3:00'),
    generateNameChangeItem('neon', 'beda', '09.08.2023 3:00'),
  ]);

  prepareNamesList();
  const namesList = getNamesList();
  const uniqueIds = getUniqueIds(namesList);

  expect(uniqueIds).toBe(2);
});

describe('Different dates format', () => {
  test('Day variations', () => {
    jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
      generateNameChangeItem('1', '2', '01.05.2023 3:00'),
      generateNameChangeItem('2', '3', '2.05.2023 3:00'),
    ]);

    prepareNamesList();
    const namesList = getNamesList();
    const uniqueIds = getUniqueIds(namesList);

    expect(uniqueIds).toBe(1);
  });

  test('Month variations', () => {
    jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
      generateNameChangeItem('1', '2', '01.05.2023 3:00'),
      generateNameChangeItem('2', '3', '02.05.2023 3:00'),
    ]);

    prepareNamesList();
    const namesList = getNamesList();
    const uniqueIds = getUniqueIds(namesList);

    expect(uniqueIds).toBe(1);
  });

  test('Year variations', () => {
    jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
      generateNameChangeItem('1', '2', '01.05.2023 3:00'),
      generateNameChangeItem('2', '3', '02.05.2024 3:00'),
    ]);

    prepareNamesList();
    const namesList = getNamesList();
    const uniqueIds = getUniqueIds(namesList);

    expect(uniqueIds).toBe(1);
  });

  test('Hour variations', () => {
    jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
      generateNameChangeItem('1', '2', '01.05.2023 3:00'),
      generateNameChangeItem('2', '3', '02.05.2023 03:00'),
    ]);

    prepareNamesList();
    const namesList = getNamesList();
    const uniqueIds = getUniqueIds(namesList);

    expect(uniqueIds).toBe(1);
  });

  test('Minute variations', () => {
    jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
      generateNameChangeItem('1', '2', '01.05.2023 3:05'),
      generateNameChangeItem('2', '3', '02.05.2023 3:5'),
    ]);

    prepareNamesList();
    const namesList = getNamesList();
    const uniqueIds = getUniqueIds(namesList);

    expect(uniqueIds).toBe(1);
  });

  test('With and without seconds', () => {
    jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
      generateNameChangeItem('1', '2', '01.05.2023 3:00'),
      generateNameChangeItem('2', '3', '02.05.2023 3:00:00'),
    ]);

    prepareNamesList();
    const namesList = getNamesList();
    const uniqueIds = getUniqueIds(namesList);

    expect(uniqueIds).toBe(1);
  });

  test('With invalid time', () => {
    jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
      generateNameChangeItem('1', '2', '01.05.2023 a:b'),
    ]);

    prepareNamesList();
    const namesList = getNamesList();
    const uniqueIds = getUniqueIds(namesList);

    expect(uniqueIds).toBe(0);
  });

  test('With invalid date', () => {
    jest.spyOn(syncParse, 'parse').mockReturnValueOnce([
      generateNameChangeItem('1', '2', 'a.b.c 3:00'),
    ]);

    prepareNamesList();
    const namesList = getNamesList();
    const uniqueIds = getUniqueIds(namesList);

    expect(uniqueIds).toBe(0);
  });
});
