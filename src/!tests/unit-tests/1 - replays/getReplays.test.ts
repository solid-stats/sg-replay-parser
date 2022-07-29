import fs from 'fs';

import getReplays from '../../../1 - replays/getReplays';
import { generateReplay } from './utils';

const data: Output = {
  parsedReplays: [],
  replays: [
    generateReplay('sg', 'test_name_1'),
    generateReplay('sg', 'test_name_1'),
    generateReplay('sg', 'test_name_2'),
    generateReplay('sg', 'mace1'),
    generateReplay('sg', 'sg1'),
    generateReplay('mace', 'test_name_2'),
    generateReplay('mace', 'test_name_3'),
    generateReplay('mace', 'test_name_4'),
    generateReplay('mace', 'test_name_4'),
    generateReplay('mace', 'mace2'),
    generateReplay('mace', 'sg2'),
    generateReplay('sgs', 'test_sgs_name'),
  ],
  problematicReplays: [],
};

jest.mock('fs');
jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(data));

test('Should return correct SG replays', async () => {
  expect(await getReplays('sg')).toMatchObject([
    generateReplay('sg', 'test_name_1'),
    generateReplay('sg', 'test_name_2'),
    generateReplay('sg', 'mace1'),
    generateReplay('sg', 'sg1'),
  ]);
});

test('Should return correct Mace replays', async () => {
  expect(await getReplays('mace')).toMatchObject([
    generateReplay('mace', 'test_name_3'),
    generateReplay('mace', 'test_name_4'),
    generateReplay('mace', 'mace2'),
    generateReplay('mace', 'sg2'),
  ]);
});

test('Should raise exception', async () => {
  jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
    throw new Error();
  });

  return expect(getReplays('mace')).rejects.toThrow('not found, start prepare-replays job first.');
});
