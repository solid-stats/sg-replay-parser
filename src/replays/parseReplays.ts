import { compareAsc, format } from 'date-fns';
import pLimit from 'p-limit';

import { dateFnsOptionsWithFirstWeekDate } from '../consts';
import fetchData from '../fetchData';
import parseReplayInfo from '../parseReplayInfo';

const fetchReplayInfo = async (replay: Replay): Promise<PlayersGameResultWithDate> => {
  const replayInfo = await fetchData<ReplayInfo>(`https://replays.solidgames.ru/data/${replay.filename}.json`);
  const parsedReplayInfo = parseReplayInfo(replayInfo);

  console.log('——————————————————————————————');
  console.log(`Parsed replay\nserver id: ${replay.serverId}\nmission name: ${replay.mission_name}\ndate: ${format(replay.date, 'yyyy-MM-dd', dateFnsOptionsWithFirstWeekDate)}\nfilename: ${replay.filename}`);
  console.log('——————————————————————————————');

  return {
    result: parsedReplayInfo,
    date: replay.date,
  };
};

const parseReplays = async (replays: Replay[]) => {
  const limit = pLimit(20);
  const parsedReplays = await Promise.all(
    replays.map((replay) => limit(() => fetchReplayInfo(replay))),
  );
  const orderedParsedReplaysByDate = parsedReplays.sort(
    (first, second) => compareAsc(first.date, second.date),
  );

  return orderedParsedReplaysByDate;
};

export default parseReplays;
