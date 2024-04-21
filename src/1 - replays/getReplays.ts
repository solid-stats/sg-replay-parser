import fs from 'fs-extra';
import { uniqBy } from 'lodash';

import { replaysListPath } from '../0 - utils/paths';

const getReplays = async (gameType: GameType): Promise<Replay[]> => {
  let allReplays: Replay[] = [];

  try {
    const fileContents = JSON.parse(fs.readFileSync(replaysListPath, 'utf8')) as Output;

    allReplays = fileContents.replays;
  } catch {
    throw new Error(`${replaysListPath} not found, start prepare-replays job first.`);
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
