import generateMaceList from '.';

import logger from '../../0 - utils/logger';

// used in development

const runGenerateMaceList = async (): Promise<void> => {
  try {
    await generateMaceList();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    logger.fatal(`generateMaceList failed. Error: ${error.message}. Stack: ${error.stack}`);
    process.exitCode = 1;
  }
};

runGenerateMaceList();
