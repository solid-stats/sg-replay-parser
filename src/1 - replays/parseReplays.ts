import { compact, orderBy } from 'lodash';
import pLimit from 'p-limit';

import fetchData from '../0 - utils/fetchData';
import promiseAllWithProgress from '../0 - utils/promiseAllWithProgress';
import parseReplayInfo from '../2 - parseReplayInfo';

const fetchReplayInfo = async (
  replay: Replay,
  gameType: GameType,
): Promise<PlayersGameResult | null> => {
  try {
    const replayInfo = await fetchData<ReplayInfo>(
      `https://solidgames.ru/data/${replay.filename}.json`,
    );

    const parsedReplayInfo = parseReplayInfo(replayInfo);
    const result = Object.values(parsedReplayInfo);

    if (gameType === 'mace' && result.length < 10) return null;

    return {
      result,
      date: replay.date,
      missionName: replay.mission_name,
      replayLink: replay.replayLink,
    };
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

const parseReplays = async (
  replays: Replay[],
  gameType: GameType,
): Promise<PlayersGameResult[]> => {
  const limit = pLimit(gameType === 'sg' ? 10 : 20);
  const parsedReplays = await promiseAllWithProgress(
    replays.map((replay) => limit(() => fetchReplayInfo(replay, gameType))),
    gameType,
  );
  // compact remove null vallues
  const orderedParsedReplaysByDate = orderBy(compact(parsedReplays), 'date', 'asc');

  return orderedParsedReplaysByDate;
};

export default parseReplays;
