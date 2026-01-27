import limitAndOrder from './limitAndOrder';

test('limitAndOrder sorts and limits', () => {
  const list = [{ count: 1 }, { count: 3 }, { count: 2 }];
  const result = limitAndOrder(list, ['count'], ['desc'], 2);
  expect(result.map((item) => item.count)).toEqual([3, 2]);
});
