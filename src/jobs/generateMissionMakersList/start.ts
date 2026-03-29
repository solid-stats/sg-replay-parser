import generateMissionMakersList from '.';

import showCliHelp from '../../0 - utils/cliHelp';
import logger from '../../0 - utils/logger';

if (showCliHelp('generate-mission-makers-list', 'Generate the mission makers HTML output.')) {
  process.exit(0);
}

const runGenerateMissionMakersList = async (): Promise<void> => {
  try {
    await generateMissionMakersList();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));

    logger.fatal(`generateMissionMakersList failed. Error: ${error.message}. Stack: ${error.stack}`);
    process.exitCode = 1;
  }
};

runGenerateMissionMakersList();
