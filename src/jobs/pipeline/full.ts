/**
 * Pipeline Job: Full Pipeline
 *
 * This job runs the complete pipeline: discover → download → parse → statistics → output
 *
 * Usage:
 *   npm run build-dist && node dist/jobs/pipeline/full.js
 *   npm run build-dist && node dist/jobs/pipeline/full.js --full
 *   npm run build-dist && node dist/jobs/pipeline/full.js --output (generate output only)
 */

import { initDbClient } from '../../db/client';
import { quickDiscovery, fullDiscovery } from '../../services/discovery';
import { processDiscoveredReplays, getDiscoveredCount, getDownloadedCount } from '../../services/download';
import { generateAllOutput } from '../../services/output';
import { parseDownloadedReplays, getParsedCount } from '../../services/parse';
import { calculateAllStatistics } from '../../services/statistics';

const runFullPipeline = async () => {
  const isFullScan = process.argv.includes('--full');
  const outputOnly = process.argv.includes('--output');

  // eslint-disable-next-line no-console
  console.log(`
=========================================
Starting FULL PIPELINE
Mode: ${outputOnly ? 'OUTPUT ONLY' : isFullScan ? 'FULL SCAN' : 'QUICK'}
=========================================
`);

  try {
    initDbClient();

    if (!outputOnly) {
      // Step 1: Discovery
      // eslint-disable-next-line no-console
      console.log('STEP 1: Discovery...');
      const discoveryResult = isFullScan
        ? await fullDiscovery()
        : await quickDiscovery();

      // eslint-disable-next-line no-console
      console.log(`Discovery: Found ${discoveryResult.discovered} new replays, saved ${discoveryResult.saveResult.saved}`);

      // Step 2: Download
      // eslint-disable-next-line no-console
      console.log('\nSTEP 2: Download...');
      const discoveredCount = await getDiscoveredCount();

      if (discoveredCount === 0) {
        // eslint-disable-next-line no-console
        console.log('No replays to download');
      } else {
        const downloadResult = await processDiscoveredReplays();

        // eslint-disable-next-line no-console
        console.log(`Download: ${downloadResult.successful} successful, ${downloadResult.failed} failed`);
      }

      // Step 3: Parse
      // eslint-disable-next-line no-console
      console.log('\nSTEP 3: Parse...');
      const downloadedCount = await getDownloadedCount();

      if (downloadedCount === 0) {
        // eslint-disable-next-line no-console
        console.log('No replays to parse');
      } else {
        const parseResult = await parseDownloadedReplays();

        // eslint-disable-next-line no-console
        console.log(`Parse: ${parseResult.successful} successful, ${parseResult.failed} failed`);
      }
    }

    // Step 4: Calculate statistics and generate output
    const totalParsed = await getParsedCount();

    if (totalParsed > 0) {
      // eslint-disable-next-line no-console
      console.log('\nSTEP 4: Statistics & Output...');
      const stats = await calculateAllStatistics();

      // eslint-disable-next-line no-console
      console.log(`Statistics: SG ${stats.sg.global.length} players, ${stats.sg.squad.length} squads`);
      // eslint-disable-next-line no-console
      console.log(`            MACE ${stats.mace.global.length} players, ${stats.mace.squad.length} squads`);

      await generateAllOutput(stats);

      // eslint-disable-next-line no-console
      console.log('Output: Files generated successfully');
    }

    // Final summary
    const totalDiscovered = await getDiscoveredCount();
    const totalDownloaded = await getDownloadedCount();
    const finalParsed = await getParsedCount();

    // eslint-disable-next-line no-console
    console.log(`
=========================================
PIPELINE COMPLETED
=========================================
Status Summary:
  - Discovered (pending): ${totalDiscovered}
  - Downloaded (pending): ${totalDownloaded}
  - Parsed: ${finalParsed}
=========================================
`);

    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // eslint-disable-next-line no-console
    console.error(`Pipeline failed: ${errorMessage}`);
    process.exit(1);
  }
};

runFullPipeline();
