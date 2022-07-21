import fs from 'fs';

import uniqBy from 'lodash/uniqBy';

import { replaysListFileName } from '../0 - consts';

const getReplays = async (gameType: GameType): Promise<Replay[]> => {
  let allReplays: ReplayRaw[] = [];

  try {
    allReplays = JSON.parse(fs.readFileSync(replaysListFileName, 'utf8'));
  } catch {
    throw new Error(`${replaysListFileName} not found, start prepare-replays job first.`);
  }

  const uniqueReplays = uniqBy(allReplays, 'filename');
  const replays = uniqueReplays.filter(
    (replay) => (
      replay.mission_name.startsWith(gameType)
      && !replay.mission_name.startsWith('sgs')
    ),
  );

  return replays.map((replay) => ({
    ...replay,
    date: new Date(replay.date),
  }));
};

export default getReplays;
