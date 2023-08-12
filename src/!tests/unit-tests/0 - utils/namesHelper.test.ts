import syncParse from 'csv-parse/sync';

import { dayjsUTC } from '../../../0 - utils/dayjs';
import { getNamesList } from '../../../0 - utils/namesHelper';
import { getPlayerId } from '../../../0 - utils/namesHelper/getId';
import moscowDateToUTC from '../../../0 - utils/namesHelper/moscowDateToUTC';
import { prepareNamesList } from '../../../0 - utils/namesHelper/prepareNamesList';
import generateNameChangeItem from '../../utils/generators/generateNameChangeItem';

const exampleNamesChanges = [
  generateNameChangeItem('Parker', 'morpex', '12.11.2022 06:21'),
  generateNameChangeItem('morpex', 'Parker', '26.12.2022 22:01'),

  generateNameChangeItem('Markovnik', 'borigen', '09.04.2023 01:03'),

  generateNameChangeItem('callisto1', 'Outkast', '20.12.2022 15:45'),
  generateNameChangeItem('Outkast', 'kanistra', '30.06.2023 11:29'),
  generateNameChangeItem('kanistra', 'AllCash', '01.09.2023 13:22'),

  generateNameChangeItem('neon', 'beda', '03.02.2023 05:05'),
  generateNameChangeItem('Londor', 'neon', '03.03.2023 05:05'),
  generateNameChangeItem('neon', 'londor', '03.04.2023 05:05'),
  generateNameChangeItem('beda', 'neon', '03.05.2023 05:05'),
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

test('Moscow date to UTC should work correctly', () => {
  const pureUTCDate = dayjsUTC('2022-08-01 00:00:00').toISOString();
  // moscow tz is +3 from utc
  const UTCDateFromMoscow = moscowDateToUTC('01.08.2022 03:00').toISOString();

  expect(pureUTCDate).toEqual(UTCDateFromMoscow);
});

describe('getPlayerId func should work correctly', () => {
  it('Name change should work correctly', () => {
    const oldNameId = getPlayerId('markoVnik', dayjsUTC('2022-01-01'));
    const newNameId = getPlayerId('borigen', dayjsUTC('2023-05-01'));

    const wrongId = getPlayerId('markoVnik', dayjsUTC('2023-05-01'));

    expect(oldNameId).toEqual(newNameId);
    expect(oldNameId).not.toEqual(wrongId);
  });

  it('Name changes sequence should work correctly', () => {
    const ids = [
      getPlayerId('callisto1', dayjsUTC('2022-01-01')),
      getPlayerId('Outkast', dayjsUTC('2023-01-01')),
      getPlayerId('AllCash', dayjsUTC('2023-10-13')),
    ];

    const wrongId = getPlayerId('callisto1', dayjsUTC('2023-10-13'));

    ids.forEach((id, index) => {
      const prevId = ids[index - 1];

      if (!prevId) return;

      expect(id).toEqual(prevId);
    });

    ids.forEach((id) => {
      expect(id).not.toEqual(wrongId);
    });
  });

  it('Name change and then change back to the same name should work correctly', () => {
    const id = getPlayerId('Parker', dayjsUTC('2022-01-01'));
    const changedNameId = getPlayerId('morpex', dayjsUTC('2022-12-01'));
    const changedBackNameId = getPlayerId('Parker', dayjsUTC('2023-01-01'));

    const wrongId = getPlayerId('Parker', dayjsUTC('2022-12-01'));

    expect(changedNameId).toEqual(id);
    expect(changedBackNameId).toEqual(id);

    expect(wrongId).not.toEqual(id);
    expect(wrongId).not.toEqual(changedNameId);
    expect(wrongId).not.toEqual(changedBackNameId);
  });

  it('Name change collision after name change and before change back should be handled correctly', () => {
    const firstPlayerId = getPlayerId('neon', dayjsUTC('2023-01-01'));
    const secondPlayerId = getPlayerId('londor', dayjsUTC('2023-01-01'));

    const firstPlayerIdAfterChange = getPlayerId('beda', dayjsUTC('2023-03-10'));
    const secondPlayerIdAfterChange = getPlayerId('neon', dayjsUTC('2023-03-10'));

    const firstPlayerIdAfterChangeBack = getPlayerId('neon', dayjsUTC('2023-06-10'));
    const secondPlayerIdAfterChangeBack = getPlayerId('londor', dayjsUTC('2023-06-10'));

    expect(firstPlayerId).not.toEqual(secondPlayerId);

    expect(firstPlayerIdAfterChange).toEqual(firstPlayerId);
    expect(secondPlayerIdAfterChange).toEqual(secondPlayerId);

    expect(firstPlayerIdAfterChangeBack).toEqual(firstPlayerId);
    expect(secondPlayerIdAfterChangeBack).toEqual(secondPlayerId);
  });

  it('getPlayerId in edge times should return null', () => {
    const correctId = getPlayerId('markoVnik', moscowDateToUTC('09.04.2023 01:00'));
    const correctNewId = getPlayerId('borigen', moscowDateToUTC('09.04.2023 01:04'));

    const wrongEdgeId = getPlayerId('markoVnik', moscowDateToUTC('09.04.2023 01:03'));

    expect(correctId).toEqual(correctNewId);
    expect(correctId).not.toEqual(wrongEdgeId);
  });
});
