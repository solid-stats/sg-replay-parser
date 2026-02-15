import startFetchingReplays from '.';

import logger from '../../0 - utils/logger';

// used in development

const runPrepareReplaysList = async (): Promise<void> => {
  try {
    await startFetchingReplays();
    logger.info('prepareReplaysList completed successfully.');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    logger.fatal(`prepareReplaysList failed. Error: ${error.message}. Stack: ${error.stack}`);
    process.exitCode = 1;
  }
};

runPrepareReplaysList();
