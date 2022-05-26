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
  } catch {
    return null;
  }
};

const parseReplays = async (replays: Replay[]) => {
  const limit = pLimit(20);
  const parsedReplays = await promiseAllWithProgress(
    replays.map((replay) => limit(() => fetchReplayInfo(replay))),
  );
  // compact remove null vallues
  const orderedParsedReplaysByDate = compact(parsedReplays).sort((first, second) => (
    compareAsc(first.date, second.date)
  ));

  return orderedParsedReplaysByDate;
};

export default parseReplays;
