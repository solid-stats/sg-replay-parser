import { round } from 'lodash';

const calculateDistance = (
  point1: Position | Position3D,
  point2: Position | Position3D,
): number => (
  round(
    Math.sqrt(
      (point2[0] - point1[0]) ** 2
      + (point2[1] - point1[1]) ** 2,
    ),
  )
);

export default calculateDistance;
