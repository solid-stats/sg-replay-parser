import calculateVehicleKillsCoef from '../../../0 - utils/calculateVehicleKillsCoef';

test('should return 0 when kills from vehicle is 0', () => {
  expect(calculateVehicleKillsCoef(10, 0)).toBe(0);
});

test('should return 0 when total kills is 0', () => {
  expect(calculateVehicleKillsCoef(0, 5)).toBe(0);
});

test('should return rounded coefficient when both values are present', () => {
  expect(calculateVehicleKillsCoef(9, 2)).toBe(0.22);
});
