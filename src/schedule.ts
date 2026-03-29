import Cron from 'croner';
import fs from 'fs-extra';

import startParsingReplays from '.';

import showCliHelp from './0 - utils/cliHelp';
import generateBasicFolders from './0 - utils/generateBasicFolders';
import logger from './0 - utils/logger';
import { tempResultsPath } from './0 - utils/paths';
import { isCloudflareBanError } from './0 - utils/request';
import generateMaceList from './jobs/generateMaceListHTML';
import generateMissionMakersList from './jobs/generateMissionMakersList';
import startFetchingReplays from './jobs/prepareReplaysList';
import updateNameChangesCsv from './jobs/updateNameChangesCsv';

if (showCliHelp('schedule', 'Start the cron-based runtime orchestration loop.')) {
  process.exit(0);
}

generateBasicFolders();

const webParsersCron = '*/20 * * * *';
const parsingCron = '1-59/20 * * * *';

Cron(
  webParsersCron,
  { protect: true },
  async () => {
    try {
      await generateMissionMakersList();
    } catch (err) {
      if (isCloudflareBanError(err)) {
        logger.fatal((err as Error).message);

        return;
      }

      logger.fatal(`Error during fetching mission makers list. Trace: ${err.stack}`);
    }
  },
);

const generateMaceListJob = async () => {
  try {
    generateMaceList();
  } catch (err) {
    logger.fatal(`Error during mace list generation. Trace: ${err.stack}`);
  }
};

const replaysFetcherJob = Cron(
  webParsersCron,
  { protect: true },
  async () => {
    try {
      await startFetchingReplays(10);
    } catch (err) {
      if (isCloudflareBanError(err)) {
        logger.fatal((err as Error).message);

        return;
      }

      logger.fatal(`Error during fetching replays list. Trace: ${err.stack}`);
    }

    generateMaceListJob();
  },
);

const waitReplaysFetchingToFinish = async (): Promise<void> => (
  new Promise((resolve) => {
    const wait = setInterval(() => {
      if (!replaysFetcherJob.isBusy()) {
        resolve();
        clearInterval(wait);
      }
    }, 20);
  })
);

Cron(
  parsingCron,
  { protect: true },
  async () => {
    if (replaysFetcherJob.isBusy()) {
      const beforeMsg = 'Replays list is preparing, waiting...';
      const afterMsg = 'Replays list is finished.';

      logger.info(beforeMsg);

      await waitReplaysFetchingToFinish();

      logger.info(afterMsg);
    }

    try {
      await updateNameChangesCsv();
      fs.removeSync(tempResultsPath);

      await startParsingReplays();
    } catch (err) {
      logger.fatal(`Error during parsing replays list. Trace: ${err.stack}`);

      fs.removeSync(tempResultsPath);
    }
  },
);

if (process.env.NODE_ENV !== 'production') {
  logger.info('Schedule bootstrapped successfully in non-production mode.');
  process.exit(0);
}
