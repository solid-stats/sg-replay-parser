import fs from 'fs';

import { compareAsc } from 'date-fns';

import fetchData from './fetchData';
import addPlayerGameResultToGlobalStatistics from './globalStatistics/add';
import sortPlayerStatistics from './output/sortStatistics';
import parseReplayInfo from './parseReplay';

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

  console.log('Parsing replays completed.');
  console.log('Started collecting statistics.');

  const globalStatistics = processReplays(orderedParsedReplaysByDate.reverse());
  const sortedStatisticsByScore = sortPlayerStatistics(globalStatistics);
  const filteredStatistics = sortedStatisticsByScore.filter(
    (statistics) => statistics.totalPlayedGames > 20,
  );

  fs.mkdirSync('output');
  fs.writeFileSync('output/stats.json', JSON.stringify(filteredStatistics), 'ascii');

  console.log('Completed.');
})();
