import mergeOtherPlayers from '../../../0 - utils/mergeOtherPlayers';
import getDefaultTestDescription from '../../utils/getDefaultTestDescription';

const first: OtherPlayer[] = [
  {
    id: 'test_1',
    name: 'test_1',
    count: 2,
  },
  {
    id: 'test_2',
    name: 'test_2',
    count: 1,
  },
  {
    id: '0',
    name: 'old_name',
    count: 1,
  },
];
const second: OtherPlayer[] = [
  {
    id: 'test_2',
    name: 'test_2',
    count: 9,
  },
  {
    id: 'test_3',
    name: 'test_3',
    count: 4,
  },
  {
    id: '0',
    name: 'new_name',
    count: 4,
  },
];

const expectedResult: OtherPlayer[] = [
  {
    id: 'test_1',
    name: 'test_1',
    count: 2,
  },
  {
    id: 'test_2',
    name: 'test_2',
    count: 10,
  },
  {
    id: '0',
    name: 'new_name',
    count: 5,
  },
  {
    id: 'test_3',
    name: 'test_3',
    count: 4,
  },
];

test(getDefaultTestDescription('mergeOtherPlayers'), () => {
  expect(mergeOtherPlayers(first, second)).toEqual(expectedResult);
});
