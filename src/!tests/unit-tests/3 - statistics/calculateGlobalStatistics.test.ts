/* eslint-disable @typescript-eslint/no-loop-func */

import calculateGlobalStatistics from '../../../3 - statistics/global';
import generateGlobalStatistics from './generators/generateGlobalStatistics';
import generatePlayersGameResult, { TestPlayer } from './generators/generatePlayersGameResult';

const players: TestPlayer[] = [
  { name: '[FNX]Afgan0r', side: 'EAST' },
  { name: '[FNX]Flashback', side: 'EAST' },
  { name: '[FNX]Skywalker', side: 'EAST' },
  { name: '[FNX]Puma', side: 'EAST' },
  { name: '[FNX]Mecheniy', side: 'EAST' },
  { name: '[FNX]Brom', side: 'EAST' },
  { name: '[FNX]T1m', side: 'EAST' },
  { name: '[FNX]LONDOR', side: 'EAST' },
  { name: '[Creep]Frexis', side: 'GUER' },
  { name: '[Creep]Axus', side: 'GUER' },
  { name: '[Creep]HIZL', side: 'GUER' },
  { name: '[Creep]Tundra', side: 'GUER' },
  { name: '[Creep]BepTyxau', side: 'GUER' },
  { name: '[Creep]Srochnik', side: 'GUER' },
  { name: '[Creep]Savchikkk', side: 'GUER' },
  { name: '[Creep]Karibo', side: 'GUER' },
  { name: '[Creep]nyM6a', side: 'GUER' },
  { name: '[CU]HaskiLove', side: 'GUER' },
  { name: '[CU]Nucis', side: 'GUER' },
  { name: '[CU]Grow', side: 'GUER' },
  { name: '[CU]Savel', side: 'GUER' },
  { name: '[CU]Koshmar', side: 'GUER' },
  { name: '[CU]Eeshka', side: 'GUER' },
];

describe('Should test calculateGlobalStatistics with random data 10 times', () => {
  for (let index = 0; index < 10; index += 1) {
    it('Should return correct value', () => {
      const playersGameResult = generatePlayersGameResult(players, 8, '2022-07-18');
      const globalStatistics = generateGlobalStatistics(playersGameResult);

      expect(calculateGlobalStatistics(playersGameResult)).toMatchObject(globalStatistics);
    });
  }
});
