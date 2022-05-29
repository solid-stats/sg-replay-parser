import { compareAsc } from 'date-fns';
import compact from 'lodash/compact';
import pLimit from 'p-limit';

import fetchData from '../fetchData';
import parseReplayInfo from '../parseReplayInfo';
import promiseAllWithProgress from '../utils/promiseAllWithProgress';

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
  const limit = pLimit(gameType === 'sg' ? 5 : 25);
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
