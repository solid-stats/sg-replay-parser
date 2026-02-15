import generateMissionMakersList from '.';

import logger from '../../0 - utils/logger';

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
