import fs from 'fs-extra';
import { uniqBy } from 'lodash';

import { replaysListDir } from '../0 - utils/dirs';

const getReplays = async (gameType: GameType): Promise<Replay[]> => {
  let allReplays: Replay[] = [];

  try {
    const fileContents = JSON.parse(fs.readFileSync(replaysListDir, 'utf8')) as Output;

    allReplays = fileContents.replays;
  } catch {
    throw new Error(`${replaysListDir} not found, start prepare-replays job first.`);
  }

  const uniqueReplays = uniqBy(allReplays, 'filename');
  const replays = uniqueReplays.filter(
    (replay) => (
      replay.mission_name.startsWith(gameType)
      && !replay.mission_name.startsWith('sgs')
    ),
  );

  // used only for debug
  // return replays.filter((rep) => rep.filename === '2021_01_09__22_52_20_ocap');
  return replays;
};

export default getReplays;
