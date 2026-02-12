import Cron from 'croner';
import fs from 'fs-extra';

import startParsingReplays from '.';

import generateBasicFolders from './0 - utils/generateBasicFolders';
import logger from './0 - utils/logger';
import { tempResultsPath } from './0 - utils/paths';
import {
  getSgZoneRequestQueueState,
  waitForSgZoneRequestQueueToDrain,
} from './0 - utils/request';
import generateMaceList from './jobs/generateMaceListHTML';
import generateMissionMakersList from './jobs/generateMissionMakersList';
import startFetchingReplays from './jobs/prepareReplaysList';

generateBasicFolders();

let siteRequestJobsQueue: Promise<void> = Promise.resolve();

const formatQueueStateForLog = () => {
  const queueState = getSgZoneRequestQueueState();

  return `pending=${queueState.pending}, active=${queueState.active}, total=${queueState.total}`;
};

const runSiteRequestJob = async (
  jobName: string,
  jobCallback: () => Promise<void>,
): Promise<void> => {
  const queuedJob = siteRequestJobsQueue.then(
    async () => {
      const waitStartTimestamp = Date.now();

      logger.info(`[schedule][${jobName}] Waiting for sg.zone queue to drain. ${formatQueueStateForLog()}`);
      await waitForSgZoneRequestQueueToDrain();
      logger.info(
        `[schedule][${jobName}] Queue drained after ${Date.now() - waitStartTimestamp}ms. ${formatQueueStateForLog()}. Starting job.`,
      );
      await jobCallback();
      logger.info(`[schedule][${jobName}] Job finished. ${formatQueueStateForLog()}`);
    },
  );

  siteRequestJobsQueue = queuedJob.catch(() => undefined);

  await queuedJob;
};

Cron(
  '5 */2 * * *',
  { protect: true },
  async () => {
    await runSiteRequestJob(
      'generateMissionMakersList',
      async () => {
        try {
          await generateMissionMakersList();
        } catch (err) {
          logger.error(`Error during fetching mission makers list. Trace: ${err.stack}`);
        }
      },
    );
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
  '5 */2 * * *',
  { protect: true },
  async () => {
    await runSiteRequestJob(
      'startFetchingReplays',
      async () => {
        try {
          await startFetchingReplays();
        } catch (err) {
          logger.error(`Error during fetching replays list. Trace: ${err.stack}`);
        }

        generateMaceListJob();
      },
    );
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
  '0 1-23/2 * * *',
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
