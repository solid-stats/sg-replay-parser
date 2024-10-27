import path from 'path';

import fs from 'fs-extra';

import logger from '../../0 - utils/logger';
import { rawReplaysPath } from '../../0 - utils/paths';
import request from '../../0 - utils/request';

const saveReplayFile = async (filename: string): Promise<Boolean> => {
  const resultFilenamePath = path.join(rawReplaysPath, `${filename}.json`);

  try {
    fs.accessSync(resultFilenamePath);

    return true;
  // eslint-disable-next-line no-empty
  } catch (e) { }

  const replay = await request(`https://sg.zone/data/${filename}.json`);

  if (!replay) return false;

  try {
    const replayJSON = await replay.text() as string;

    fs.writeFileSync(resultFilenamePath, replayJSON);
  } catch (err) {
    logger.error(`Error occurred while saving replay file: ${err.message}. Trace: ${err.stack}`);

    return false;
  }

  return true;
};

export default saveReplayFile;
