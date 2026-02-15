import startParsingReplays from '.';

import logger from './0 - utils/logger';

// used in development

const runStartParsingReplays = async (): Promise<void> => {
  try {
    await startParsingReplays();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    logger.fatal(`startParsingReplays failed. Error: ${error.message}. Stack: ${error.stack}`);
    process.exitCode = 1;
  }
};

runStartParsingReplays();
