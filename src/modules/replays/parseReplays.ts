import path from 'path';

import fs from 'fs-extra';
import { compact, orderBy } from 'lodash';
import pLimit from 'p-limit';

import parseReplayInfo from '../parsing';
import logger from '../../shared/utils/logger';
import { rawReplaysPath } from '../../shared/utils/paths';

export const fetchReplayInfo = async (filename: Replay['filename']): Promise<ReplayInfo | null> => {
  try {
    const replay = fs.readJsonSync(path.join(rawReplaysPath, `${filename}.json`)) as ReplayInfo;

    return replay;
  } catch (err) {
    logger.error(`Error occurred during raw replay reading: ${err.message}. Trace: ${err.stack}`);

    return null;
  }
};

const processReplay = async (
  replay: Replay,
  gameType: GameType,
): Promise<PlayersGameResult | null> => {
  const replayInfo = await fetchReplayInfo(replay.filename);

  if (!replayInfo) return null;

  try {
    const parsedReplayInfo = parseReplayInfo(replayInfo, replay.date);
    const result = Object.values(parsedReplayInfo);

    if (gameType === 'mace' && result.length < 10) return null;

    return {
      result,
      date: replay.date,
      missionName: replay.mission_name,
    };
  } catch (err) {
    logger.error(
      `
Error occurred during replay parsing.
Replay: ${replay.filename};
Error: ${err.message};
Trace: ${err.stack}`,
    );

    return null;
  }
};

const parseReplays = async (
  replays: Replay[],
  gameType: GameType,
): Promise<PlayersGameResult[]> => {
  const limit = pLimit(gameType === 'mace' ? 50 : 25);
  const parsedReplays = await Promise.all(
    replays.map(
      (replay) => limit(
        () => processReplay(replay, gameType),
      ),
    ),
  );

  const orderedParsedReplaysByDate = orderBy(compact(parsedReplays), 'date', 'asc');

  return orderedParsedReplaysByDate;
};

export default parseReplays;
