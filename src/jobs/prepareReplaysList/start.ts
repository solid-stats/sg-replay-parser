import startFetchingReplays from '.';

import showCliHelp from '../../0 - utils/cliHelp';
import logger from '../../0 - utils/logger';

// used in development

if (showCliHelp('generate-replays-list', 'Fetch replay metadata and raw replay files.')) {
  process.exit(0);
}

const runPrepareReplaysList = async (): Promise<void> => {
  try {
    await startFetchingReplays(null);
    logger.info('prepareReplaysList completed successfully.');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    logger.fatal(`prepareReplaysList failed. Error: ${error.message}. Stack: ${error.stack}`);
    process.exitCode = 1;
  }
};

runPrepareReplaysList();
