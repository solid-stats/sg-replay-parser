import path from 'path';

import fs from 'fs-extra';

import logger from '../0 - utils/logger';
import { rawReplaysPath } from '../0 - utils/paths';

const fetchReplayInfo = async (filename: string): Promise<ReplayInfo | null> => {
  try {
    return await fs.readJson(path.join(rawReplaysPath, `${filename}.json`)) as ReplayInfo;
  } catch (error) {
    logger.error(
      `
Error occurred while fetching raw replay data.
Replay: ${filename};
Error: ${String(error)}`,
    );

    return null;
  }
};

export default fetchReplayInfo;
