import { compareAsc } from 'date-fns';

import fetchData from './fetchData';
import addPlayerGameResultToGlobalStatistics from './globalStatistics/add';
import generateOutput from './output/generateOutput';
import parseReplayInfo from './parseReplay';
import sortPlayerStatistics from './utils/sortStatistics';

const processReplays = (replays: ReplayInfoWithDate[]): GlobalPlayerStatistics[] => {
  let globalStatistics: GlobalPlayerStatistics[] = [];

  replays.forEach((replayInfo) => {
    const parsedReplay = parseReplayInfo(replayInfo);

    Object.values(parsedReplay).forEach((playerGameResult) => {
      globalStatistics = addPlayerGameResultToGlobalStatistics(
        globalStatistics,
        playerGameResult,
        replayInfo.date,
      );
    });
  });

  return globalStatistics;
};

const fetchReplayInfo = async (replay: Replay): Promise<ReplayInfoWithDate> => {
  const replayInfo = await fetchData<ReplayInfo>(`https://replays.solidgames.ru/data/${replay.filename}.json`);

  console.log(`Parsed replay\nserver id: ${replay.serverId}\nmission name: ${replay.world_name}\ndate: ${replay.date}\nfilename: ${replay.filename}`);
  console.log('——————————————————————————————');

  return {
    ...replayInfo,
    date: replay.date,
  };
};

(async () => {
  const replays = await fetchData<Replay[]>('https://replays.solidgames.ru/Replays');
  const sgReplays = replays.filter((replay) => replay.mission_name.includes('sg')).slice(0, 20);
  const parsedReplays = await Promise.all(
    sgReplays.map((replay) => (fetchReplayInfo(replay))),
  );
  const orderedParsedReplaysByDate = parsedReplays.sort(
    (first, second) => compareAsc(new Date(first.date), new Date(second.date)),
  );

  console.log('Parsing replays completed, started collecting statistics.');

  const globalStatistics = processReplays(orderedParsedReplaysByDate.reverse());
  const sortedStatisticsByScore = sortPlayerStatistics(globalStatistics);
  const filteredStatistics = sortedStatisticsByScore.filter(
    (statistics) => statistics.totalPlayedGames > 5,
  );

  console.log('Statistics collected, start generating output files.');

  generateOutput(filteredStatistics);

  console.log('Completed.');
})();
