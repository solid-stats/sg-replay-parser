import path from 'path';

import fs from 'fs-extra';

import { rawReplaysDir } from '../../0 - utils/dirs';
import logger from '../../0 - utils/logger';
import request from '../../0 - utils/request';

const saveReplayFile = async (filename: string): Promise<Boolean> => {
  const resultFilenamePath = path.join(rawReplaysDir, `${filename}.json`);

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
