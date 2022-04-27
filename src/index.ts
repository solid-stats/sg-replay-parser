import generateOutput from './output';
import getReplays from './replays/getReplays';
import parseReplays from './replays/parseReplays';
import getGlobalStatistics from './statistics/global';
import calculateSquadStatistics from './statistics/squads';

(async () => {
  const replays = await getReplays();
  const parsedReplays = await parseReplays(replays);

  console.log('\nParsing replays completed, started collecting statistics:');

  const globalStatistics = getGlobalStatistics(parsedReplays.slice(0, 50));

  console.log('- Global player statistics collected;');

  const squadStatistics = calculateSquadStatistics(globalStatistics);

  console.log('- Squad statistics collected;');
  console.log('\nAll statistics collected, start generating output files.');

  generateOutput({
    global: globalStatistics,
    squad: squadStatistics,
  });

  console.log('\nCompleted.');
})();
