import Cron from 'croner';
import fs from 'fs-extra';

import startParsingReplays from '.';

// import { pingMonitor } from './0 - utils/cronitorHelper';
import { tempResultsDir } from './0 - utils/dirs';
import generateBasicFolders from './0 - utils/generateBasicFolders';
import logger from './0 - utils/logger';
import generateMaceList from './jobs/generateMaceListHTML';
import generateMissionMakersList from './jobs/generateMissionMakersList';
import startFetchingReplays from './jobs/prepareReplaysList';

generateBasicFolders();

Cron(
  '*/5 * * * *',
  {
    protect: true,
    catch: (err: Error) => {
      logger.error(`Error during fetching mission makers list. Trace: ${err.stack}`);
      // pingMonitor('missionMakersFetcher', 'fail', err.message);
    },
  },
  async () => {
    // pingMonitor('missionMakersFetcher', 'run');
    await generateMissionMakersList();
    // pingMonitor('missionMakersFetcher', 'complete');
  },
);

const generateMaceListJob = () => {
  // pingMonitor('maceListGenerator', 'run');

  try {
    generateMaceList();
  } catch (e) {
    // pingMonitor('maceListGenerator', 'fail', e.message);
  }

  // pingMonitor('maceListGenerator', 'complete');
};

const replaysFetcherJob = Cron(
  '*/5 * * * *',
  {
    protect: true,
    catch: (err: Error) => {
      logger.error(`Error during fetching replays list. Trace: ${err.stack}`);
      // pingMonitor('replaysFetcher', 'fail', err.message);
    },
  },
  async () => {
    // pingMonitor('replaysFetcher', 'run');
    await startFetchingReplays();
    // pingMonitor('replaysFetcher', 'complete');

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
  {
    protect: true,
    catch: (err: Error) => {
      logger.error(`Error during parsing replays list. Trace: ${err.stack}`);
      fs.rmdirSync(tempResultsDir, { recursive: true });
      // pingMonitor('replaysParser', 'fail', err.message);
    },
  },
  async () => {
    // pingMonitor('replaysParser', 'run');

    if (replaysFetcherJob.isBusy()) {
      const beforeMsg = 'Replays list is preparing, waiting...';
      const afterMsg = 'Replays list is finished.';

      logger.info(beforeMsg);
      // pingMonitor('replaysParser', 'ok', beforeMsg);

      await waitReplaysFetchingToFinish();

      logger.info(afterMsg);
      // pingMonitor('replaysParser', 'ok', afterMsg);
    }

    fs.mkdirSync(tempResultsDir);
    await startParsingReplays();
    fs.rmdirSync(tempResultsDir, { recursive: true });
    // pingMonitor('replaysParser', 'complete');
  },
);
