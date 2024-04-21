import Cron from 'croner';
import fs from 'fs-extra';

import startParsingReplays from '.';

import generateBasicFolders from './0 - utils/generateBasicFolders';
import logger from './0 - utils/logger';
import { tempResultsPath } from './0 - utils/paths';
import generateMaceList from './jobs/generateMaceListHTML';
import generateMissionMakersList from './jobs/generateMissionMakersList';
import startFetchingReplays from './jobs/prepareReplaysList';

generateBasicFolders();

Cron(
  '*/5 * * * *',
  { protect: true },
  async () => {
    try {
      await generateMissionMakersList();
    } catch (err) {
      logger.error(`Error during fetching mission makers list. Trace: ${err.stack}`);
    }
  },
);

const generateMaceListJob = async () => {
  try {
    generateMaceList();
  } catch (err) {
    logger.error(`Error during mace list generation. Trace: ${err.stack}`);
  }
};

const replaysFetcherJob = Cron(
  '*/5 * * * *',
  { protect: true },
  async () => {
    try {
      await startFetchingReplays();
    } catch (err) {
      logger.error(`Error during fetching replays list. Trace: ${err.stack}`);
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
  '4 */1 * * *',
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
      fs.removeSync(tempResultsPath);

      await startParsingReplays();
    } catch (err) {
      logger.error(`Error during parsing replays list. Trace: ${err.stack}`);

      fs.removeSync(tempResultsPath);
    }
  },
);
