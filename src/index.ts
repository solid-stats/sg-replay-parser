import generateOutput from './output';
import getReplays from './replays/getReplays';
import parseReplays from './replays/parseReplays';
import calculateGlobalStatistics from './statistics/global';
import getStatsByRotations from './statistics/rotations';
import calculateSquadStatistics from './statistics/squads';

(async () => {
  const replays = await getReplays();
  const parsedReplays = await parseReplays(replays);

  console.log('\nParsing replays completed, started collecting statistics:');

  const globalStatistics = calculateGlobalStatistics(parsedReplays);

  console.log('- Global player statistics collected;');

  const squadStatistics = calculateSquadStatistics(globalStatistics);

  console.log('- Squad statistics collected;');

  const statisticsByRotation = getStatsByRotations(parsedReplays);

  console.log('- Statistics by rotation collected;');

  console.log('\nAll statistics collected, start generating output files.');

  generateOutput({
    global: globalStatistics,
    squad: squadStatistics,
  });

  console.log('\nCompleted.');
})();
