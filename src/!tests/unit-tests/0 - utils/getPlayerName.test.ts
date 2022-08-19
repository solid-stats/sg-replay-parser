import getPlayerName from '../../../0 - utils/getPlayerName';
import getDefaultTestDescription from '../../utils/getDefaultTestDescription';

type TestData = {
  input: PlayerName;
  output: [PlayerName, PlayerPrefix];
};

const testData: TestData[] = [
  { input: '[FNX] Afgan0r', output: ['Afgan0r', '[FNX]'] },
  { input: '[W8]cursed ', output: ['cursed', '[W8]'] },
  { input: ' dedInside', output: ['dedInside', null] },
  { input: ' []cursed', output: ['cursed', null] },
  { input: '[cursed ', output: ['cursed', null] },
];

testData.forEach(({ input, output }) => {
  test(getDefaultTestDescription('getPlayerName'), () => {
    expect(getPlayerName(input)).toEqual(output);
  });
});
