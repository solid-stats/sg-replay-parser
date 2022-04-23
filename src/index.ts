import { compareAsc } from 'date-fns';
import pLimit from 'p-limit';

import fetchData from './fetchData';
import addPlayerGameResultToGlobalStatistics from './globalStatistics/add';
import calculateSquadStatistics from './globalStatistics/squadStatistics';
import generateOutput from './output';
import parseReplayInfo from './parseReplay';
import sortPlayerStatistics from './utils/sortStatistics';

const processReplays = (replays: PlayersListWithDate[]): GlobalPlayerStatistics[] => {
  let globalStatistics: GlobalPlayerStatistics[] = [];

  replays.forEach((replayInfo) => {
    Object.values(replayInfo.result).forEach((playerGameResult) => {
      globalStatistics = addPlayerGameResultToGlobalStatistics(
        globalStatistics,
        playerGameResult,
        replayInfo.date,
      );
    });
  });

  return globalStatistics;
};

const fetchReplayInfo = async (replay: Replay): Promise<PlayersListWithDate> => {
  const replayInfo = await fetchData<ReplayInfo>(`https://replays.solidgames.ru/data/${replay.filename}.json`);
  const parsedReplayInfo = parseReplayInfo(replayInfo);

  console.log('——————————————————————————————');
  console.log(`Parsed replay\nserver id: ${replay.serverId}\nmission name: ${replay.mission_name}\ndate: ${replay.date}\nfilename: ${replay.filename}`);
  console.log('——————————————————————————————');

  return {
    result: parsedReplayInfo,
    date: replay.date,
  };
};

(async () => {
  const replays = await fetchData<Replay[]>('https://replays.solidgames.ru/Replays');
  const sgReplays = replays.filter((replay) => (
    replay.mission_name.includes('sg')
    && !replay.mission_name.includes('mace')
    && !replay.mission_name.includes('sgs')
  ));

  const limit = pLimit(20);
  const parsedReplays = await Promise.all(
    sgReplays.map((replay) => limit(() => fetchReplayInfo(replay))),
  );
  const orderedParsedReplaysByDate = parsedReplays.sort(
    (first, second) => compareAsc(new Date(first.date), new Date(second.date)),
  );

  console.log('Parsing replays completed, started collecting statistics.');

  const globalStatistics = processReplays(orderedParsedReplaysByDate);
  const sortedStatisticsByScore = sortPlayerStatistics(globalStatistics);
  const filteredStatistics = sortedStatisticsByScore.filter(
    (statistics) => statistics.totalPlayedGames > 20,
  );

  const squadStatistics = calculateSquadStatistics(filteredStatistics);

  console.log('Statistics collected, start generating output files.');

  generateOutput({
    global: filteredStatistics,
    squad: squadStatistics,
  });

  console.log('Completed.');
})();
