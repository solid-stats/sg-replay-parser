import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/start.ts',
    'src/schedule.ts',
    'src/jobs/prepareReplaysList/start.ts',
    'src/jobs/updateNameChangesCsv/start.ts',
    'src/jobs/generateMissionMakersList/start.ts',
    'src/jobs/generateMaceListHTML/start.ts',
    'src/!yearStatistics/index.ts',
    'src/1 - replays/workers/parseReplayWorker.ts',
  ],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  splitting: false,
  dts: false,
  shims: false,
});
