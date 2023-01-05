import { compact, orderBy } from 'lodash';
import pLimit from 'p-limit';

import fetchData from '../0 - utils/fetchData';
import promiseAllWithProgress from '../0 - utils/promiseAllWithProgress';
import parseReplayInfo from '../2 - parseReplayInfo';

export const fetchReplayInfo = async (filename: Replay['filename']): Promise<ReplayInfo | null> => {
  try {
    return await fetchData<ReplayInfo>(`https://solidgames.ru/data/${filename}.json`);
  } catch (err) {
    if (
      !err.message.includes('unexpected character')
      && !err.message.includes('invalid json response')
      && !err.message.includes('connect ETIMEDOUT')
    // eslint-disable-next-line no-console
    ) console.error(err.message);

    return null;
  }
};

const processReplay = async (
  replay: Replay,
  gameType: GameType,
): Promise<PlayersGameResult | null> => {
  const replayInfo = await fetchReplayInfo(replay.filename);

  if (replayInfo === null) return replayInfo;

  const parsedReplayInfo = parseReplayInfo(replayInfo);
  const result = Object.values(parsedReplayInfo);

  if (gameType === 'mace' && result.length < 10) return null;

  return {
    result,
    date: replay.date,
    missionName: replay.mission_name,
  };
};

const parseReplays = async (
  replays: Replay[],
  gameType: GameType,
): Promise<PlayersGameResult[]> => {
  const limit = pLimit(gameType === 'sg' ? 10 : 20);
  const parsedReplays = await promiseAllWithProgress(
    replays.map((replay) => limit(() => processReplay(replay, gameType))),
    gameType,
  );

  const orderedParsedReplaysByDate = orderBy(compact(parsedReplays), 'date', 'asc');

  return orderedParsedReplaysByDate;
};

export default parseReplays;
