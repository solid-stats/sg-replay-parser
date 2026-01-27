import fs from 'fs';
import path from 'path';

const legacyPaths = [
  'src/0 - consts',
  'src/0 - types',
  'src/0 - utils',
  'src/1 - replays',
  'src/2 - parseReplayInfo',
  'src/3 - statistics',
  'src/4 - output',
  'src/!tests',
  'src/!yearStatistics',
];

test('legacy paths are removed', () => {
  const repoRoot = path.resolve(__dirname, '../../..');
  const existing = legacyPaths.filter((legacyPath) => fs.existsSync(path.join(repoRoot, legacyPath)));
  expect(existing).toEqual([]);
});
