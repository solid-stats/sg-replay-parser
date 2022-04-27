import generateOutput from './output';
import getReplays from './replays/getReplays';
import parseReplays from './replays/parseReplays';
import getGlobalStatistics from './statistics/global';
import calculateSquadStatistics from './statistics/squads';

(async () => {
  const replays = await getReplays();
  const parsedReplays = await parseReplays(replays);

  console.log('Parsing replays completed, started collecting statistics.');

  const globalStatistics = getGlobalStatistics(parsedReplays);
  const squadStatistics = calculateSquadStatistics(globalStatistics);

  console.log('Statistics collected, start generating output files.');

  generateOutput({
    global: globalStatistics,
    squad: squadStatistics,
  });

  console.log('Completed.');
})();
