import { compareAsc } from 'date-fns';
import compact from 'lodash/compact';
import pLimit from 'p-limit';

import fetchData from '../0 - utils/fetchData';
import promiseAllWithProgress from '../0 - utils/promiseAllWithProgress';
import parseReplayInfo from '../2 - parseReplayInfo';

const fetchReplayInfo = async (replay: Replay): Promise<PlayersGameResultWithDate | null> => {
  try {
    const replayInfo = await fetchData<ReplayInfo>(
      `https://replays.solidgames.ru/data/${replay.filename}.json`,
    );
    const parsedReplayInfo = parseReplayInfo(replayInfo);

    if (Object.keys(parsedReplayInfo).length < 10) return null;

    return {
      result: parsedReplayInfo,
      date: replay.date,
      id: replay.id,
    };
  } catch (err) {
    if (
      !err.message.includes('unexpected character')
      && !err.message.includes('invalid json response')
      && !err.message.includes('connect ETIMEDOUT')
    ) console.error(err.message);

    return null;
  }
};

const parseReplays = async (replays: Replay[], gameType: GameType) => {
  const limit = pLimit(gameType === 'sg' ? 10 : 30);
  const parsedReplays = await promiseAllWithProgress(
    replays.map((replay) => limit(() => fetchReplayInfo(replay))),
    gameType,
  );
  // compact remove null vallues
  const orderedParsedReplaysByDate = compact(parsedReplays).sort((first, second) => (
    compareAsc(first.date, second.date)
  ));

  return orderedParsedReplaysByDate;
};

export default parseReplays;
