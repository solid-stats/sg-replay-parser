import mergeOtherPlayers from '../../../0 - utils/mergeOtherPlayers';
import getDefaultTestDescription from '../../utils/getDefaultTestDescription';

const first: OtherPlayer[] = [
  {
    name: 'test_1',
    count: 2,
  },
  {
    name: 'test_2',
    count: 1,
  },
];
const second: OtherPlayer[] = [
  {
    name: 'test_2',
    count: 9,
  },
  {
    name: 'test_3',
    count: 4,
  },
];

const expectedResult: OtherPlayer[] = [
  {
    name: 'test_1',
    count: 2,
  },
  {
    name: 'test_2',
    count: 10,
  },
  {
    name: 'test_3',
    count: 4,
  },
];

test(getDefaultTestDescription('mergeOtherPlayers'), () => {
  expect(mergeOtherPlayers(first, second)).toEqual(expectedResult);
});
