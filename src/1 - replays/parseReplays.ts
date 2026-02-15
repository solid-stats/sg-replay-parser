import { orderBy } from 'lodash';

import logger from '../0 - utils/logger';
import type { WorkerPool } from './workers/workerPool';

type WorkerPoolLike = Pick<WorkerPool, 'runTask'>;

const parseReplays = async (
  replays: Replay[],
  gameType: GameType,
  workerPool: WorkerPoolLike,
): Promise<PlayersGameResult[]> => {
  const responses = await Promise.all(
    replays.map((replay) => workerPool.runTask({
      filename: replay.filename,
      date: replay.date,
      missionName: replay.mission_name,
      gameType,
    })),
  );

  const parsedReplays = responses.reduce<PlayersGameResult[]>(
    (result, response) => {
      if (response.status === 'success') {
        result.push(response.data);
      }

      if (response.status === 'error') {
        logger.error(
          `
Error occurred during replay parsing.
Replay: ${response.error.filename};
Error: ${response.error.message};
Trace: ${response.error.stack}`,
        );
      }

      return result;
    },
    [],
  );

  return orderBy(parsedReplays, 'date', 'asc');
};

export default parseReplays;
