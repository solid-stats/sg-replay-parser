/**
 * Pipeline Job: Download Replays
 *
 * This job downloads replay files for all replays with DISCOVERED status
 * and updates them to DOWNLOADED status.
 *
 * Usage:
 *   npm run build-dist && node dist/jobs/pipeline/download.js
 *   npm run build-dist && node dist/jobs/pipeline/download.js --limit=50
 *   npm run build-dist && node dist/jobs/pipeline/download.js --retry
 */

import { initDbClient } from '../../db/client';
import {
  processDiscoveredReplays,
  retryFailedReplays,
  getDiscoveredCount,
  getDownloadedCount,
} from '../../services/download';

const parseArgs = () => {
  const args = process.argv.slice(2);
  let limit: number | undefined;
  let retry = false;

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.replace('--limit=', ''), 10);
    }

    if (arg === '--retry') {
      retry = true;
    }
  }

  return { limit, retry };
};

const runDownload = async () => {
  const { limit, retry } = parseArgs();

  // eslint-disable-next-line no-console
  console.log(`Starting download job${retry ? ' (RETRY MODE)' : ''}...`);

  try {
    initDbClient();

    // Show current status
    const discoveredCount = await getDiscoveredCount();
    const downloadedCount = await getDownloadedCount();

    // eslint-disable-next-line no-console
    console.log(`Current status:
  - Discovered (pending): ${discoveredCount}
  - Downloaded: ${downloadedCount}
`);

    if (retry) {
      // Retry mode: reset error replays and process
      const resetCount = await retryFailedReplays();

      // eslint-disable-next-line no-console
      console.log(`Reset ${resetCount} failed replays for retry`);
    }

    const result = await processDiscoveredReplays({ limit: limit || 10 });

    // eslint-disable-next-line no-console
    console.log(`
Download completed:
  - Total processed: ${result.processed}
  - Successful: ${result.successful}
  - Failed: ${result.failed}
`);

    if (result.failed > 0 && result.errors.length > 0) {
      // eslint-disable-next-line no-console
      console.warn('Failed downloads:');
      result.errors.slice(0, 10).forEach((err) => {
        // eslint-disable-next-line no-console
        console.warn(`  - ${err}`);
      });

      if (result.errors.length > 10) {
        // eslint-disable-next-line no-console
        console.warn(`  ... and ${result.errors.length - 10} more`);
      }
    }

    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // eslint-disable-next-line no-console
    console.error(`Download job failed: ${errorMessage}`);
    process.exit(1);
  }
};

runDownload();
