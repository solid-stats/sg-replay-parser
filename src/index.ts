import generateOutput from './output';
import getReplays from './replays/getReplays';
import parseReplays from './replays/parseReplays';
import calculateGlobalStatistics from './statistics/global';
import getStatsByRotations from './statistics/rotations';
import calculateSquadStatistics from './statistics/squads';

const parseSGGames = async (): Promise<Statistics> => {
  const replays = await getReplays();
  const parsedReplays = await parseReplays(replays);

  console.log('\nParsing SG replays completed, started collecting statistics:');

  const global = calculateGlobalStatistics(parsedReplays);

  console.log('- Global player statistics collected;');

  const squad = calculateSquadStatistics(global);

  console.log('- Squad statistics collected;');

  const byRotations = getStatsByRotations(parsedReplays);

  console.log('- Statistics by rotation collected;');

  return {
    global,
    squad,
    byRotations,
  };
};

(async () => {
  const sgStats = await parseSGGames();

  console.log('\nAll statistics collected, start generating output files.');

  generateOutput({
    sg: { ...sgStats },
    mace: { global: [], squad: [] },
  });

  console.log('\nCompleted.');
})();
