import getPlayerFullName from '../../../0 - utils/getPlayerName';
import getDefaultTestDescription from '../../utils/getDefaultTestDescription';

type TestData = {
  input: PlayerName;
  output: [PlayerName, PlayerPrefix];
};

const testData: TestData[] = [
  { input: '[FNX] Afgan0r', output: ['Afgan0r', '[FNX]'] },
  { input: '[W8]cursed ', output: ['cursed', '[W8]'] },
  { input: ' dedInside', output: ['dedInside', null] },
  { input: ' []cursed1', output: ['cursed1', null] },
  { input: '[cursed2 ', output: ['cursed2', null] },
  { input: '[KND]Morison[K]', output: ['Morison', '[KND]'] },
  { input: '[CU] Omlet [AI]', output: ['Omlet', '[CU]'] },
];

testData.forEach(({ input, output }) => {
  test(getDefaultTestDescription('getPlayerFullName'), () => {
    expect(getPlayerFullName(input)).toEqual(output);
  });
});
