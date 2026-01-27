import getDefaultTestDescription from './getDefaultTestDescription';

test('formats test descriptions', () => {
  expect(getDefaultTestDescription('getReplays')).toBe('getReplays should return correct value');
});
