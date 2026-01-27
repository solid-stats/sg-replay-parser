/**
 * Pipeline Job: Discover New Replays
 *
 * This job discovers new replays from sg.zone and saves them to the database
 * with DISCOVERED status.
 *
 * Usage:
 *   npm run build-dist && node dist/jobs/pipeline/discover.js
 *   npm run build-dist && node dist/jobs/pipeline/discover.js --full
 */

import { initDbClient } from '../../db/client';
import { quickDiscovery, fullDiscovery } from '../../services/discovery';

const runDiscovery = async () => {
  const isFullScan = process.argv.includes('--full');

  // eslint-disable-next-line no-console
  console.log(`Starting ${isFullScan ? 'FULL' : 'QUICK'} discovery job...`);

  try {
    initDbClient();

    const result = isFullScan
      ? await fullDiscovery()
      : await quickDiscovery();

    // eslint-disable-next-line no-console
    console.log(`
Discovery completed:
  - New replays discovered: ${result.discovered}
  - Saved: ${result.saveResult.saved}
  - Skipped (duplicates): ${result.saveResult.skipped}
  - Failed: ${result.saveResult.failed}
`);

    if (result.saveResult.errors.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(`Errors encountered during discovery:`);
      // eslint-disable-next-line no-console
      result.saveResult.errors.forEach((err) => console.warn(`  - ${err}`));
    }

    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error(`Discovery job failed: ${errorMessage}`);
    process.exit(1);
  }
};

runDiscovery();
