import { compareAsc } from 'date-fns';
import pLimit from 'p-limit';

import fetchData from '../fetchData';
import parseReplayInfo from '../parseReplayInfo';
import promiseAllWithProgress from '../utils/promiseAllWithProgress';

const fetchReplayInfo = async (replay: Replay): Promise<PlayersGameResultWithDate> => {
  const replayInfo = await fetchData<ReplayInfo>(`https://replays.solidgames.ru/data/${replay.filename}.json`);
  const parsedReplayInfo = parseReplayInfo(replayInfo);

  return {
    result: parsedReplayInfo,
    date: replay.date,
  };
};

const parseReplays = async (replays: Replay[]) => {
  const limit = pLimit(20);
  const parsedReplays = await promiseAllWithProgress(
    replays.map((replay) => limit(() => fetchReplayInfo(replay))),
  );
  const orderedParsedReplaysByDate = parsedReplays.sort(
    (first, second) => compareAsc(first.date, second.date),
  );

  return orderedParsedReplaysByDate;
};

export default parseReplays;
