import generateOutput from './output';
import getReplays from './replays/getReplays';
import parseReplays from './replays/parseReplays';
import calculateGlobalStatistics from './statistics/global';
import getStatsByRotations from './statistics/rotations';
import calculateSquadStatistics from './statistics/squads';

const countStatistics = async (gameType: GameType): Promise<Statistics> => {
  const replays = await getReplays(gameType);
  const parsedReplays = await parseReplays(replays);

  const global = calculateGlobalStatistics(parsedReplays);
  const squad = calculateSquadStatistics(global);
  const byRotations = gameType === 'sg' ? getStatsByRotations(parsedReplays) : null;

  return {
    global,
    squad,
    byRotations,
  };
};

(async () => {
  const [sgStats, maceStats] = await Promise.all([countStatistics('sg'), countStatistics('mace')]);

  console.log('\nAll statistics collected, start generating output files.');

  generateOutput({
    sg: { ...sgStats },
    mace: { ...maceStats },
  });

  console.log('\nCompleted.');
})();
