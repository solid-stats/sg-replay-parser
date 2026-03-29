import updateNameChangesCsv from '.';

import showCliHelp from '../../0 - utils/cliHelp';
import logger from '../../0 - utils/logger';

// used in development

if (showCliHelp('update-name-changes-csv', 'Refresh the runtime name-changes CSV data.')) {
  process.exit(0);
}

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
