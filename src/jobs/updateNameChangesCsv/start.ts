import updateNameChangesCsv from '.';

import logger from '../../0 - utils/logger';

// used in development

const runUpdateNameChangesCsv = async (): Promise<void> => {
  try {
    await updateNameChangesCsv();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    logger.fatal(`updateNameChangesCsv failed. Error: ${error.message}. Stack: ${error.stack}`);
    process.exitCode = 1;
  }
};

runUpdateNameChangesCsv();
