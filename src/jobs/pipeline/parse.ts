/**
 * Pipeline Job: Parse Replays
 *
 * This job parses downloaded replay files and extracts player statistics,
 * updating replays to PARSED status.
 *
 * Usage:
 *   npm run build-dist && node dist/jobs/pipeline/parse.js
 *   npm run build-dist && node dist/jobs/pipeline/parse.js --limit=100
 *   npm run build-dist && node dist/jobs/pipeline/parse.js --retry
 *   npm run build-dist && node dist/jobs/pipeline/parse.js --gametype=SG
 */

import { initDbClient } from '../../db/client';
import { GameType } from '../../generated/prisma/enums';
import { getDownloadedCount } from '../../services/download';
import {
  parseDownloadedReplays,
  retryFailedParsing,
  getParsedCount,
} from '../../services/parse';

const parseArgs = () => {
  const args = process.argv.slice(2);
  let limit: number | undefined;
  let retry = false;
  let gameType: GameType | undefined;

  for (const arg of args) {
    if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.replace('--limit=', ''), 10);
    }

    if (arg === '--retry') {
      retry = true;
    }

    if (arg.startsWith('--gametype=')) {
      const gt = arg.replace('--gametype=', '').toUpperCase();

      if (gt === 'SG' || gt === 'MACE' || gt === 'SM') {
        gameType = gt as GameType;
      }
    }
  }

  return { limit, retry, gameType };
};

const runParse = async () => {
  const { limit, retry, gameType } = parseArgs();

  // eslint-disable-next-line no-console
  console.log(`Starting parse job${retry ? ' (RETRY MODE)' : ''}...`);

  try {
    initDbClient();

    // Show current status (getDownloadedCount doesn't take gameType filter)
    const downloadedCount = await getDownloadedCount();
    const parsedCount = await getParsedCount(gameType);

    // eslint-disable-next-line no-console
    console.log(`Current status${gameType ? ` (${gameType})` : ''}:
  - Downloaded (pending): ${downloadedCount}
  - Parsed: ${parsedCount}
`);

    const result = retry
      ? await retryFailedParsing(limit)
      : await parseDownloadedReplays(gameType, limit);

    // eslint-disable-next-line no-console
    console.log(`
Parse completed:
  - Total processed: ${result.total}
  - Successful: ${result.successful}
  - Failed: ${result.failed}
`);

    if (result.failed > 0) {
      const failedResults = result.results.filter((r) => !r.success);

      // eslint-disable-next-line no-console
      console.warn('Failed parses:');
      failedResults.slice(0, 10).forEach((r) => {
        // eslint-disable-next-line no-console
        console.warn(`  - ${r.filename}: ${r.error}`);
      });

      if (failedResults.length > 10) {
        // eslint-disable-next-line no-console
        console.warn(`  ... and ${failedResults.length - 10} more`);
      }
    }

    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // eslint-disable-next-line no-console
    console.error(`Parse job failed: ${errorMessage}`);
    process.exit(1);
  }
};

runParse();
