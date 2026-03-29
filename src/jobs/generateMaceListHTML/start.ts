import generateMaceList from '.';

import showCliHelp from '../../0 - utils/cliHelp';
import logger from '../../0 - utils/logger';

// used in development

if (showCliHelp('generate-mace-list', 'Generate the MACE list HTML output.')) {
  process.exit(0);
}

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
