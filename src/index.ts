import { gameTypes } from './consts';
import generateOutput from './output';
import getReplays from './replays/getReplays';
import parseReplays from './replays/parseReplays';
import calculateGlobalStatistics from './statistics/global';
import getStatsByRotations from './statistics/rotations';
import calculateSquadStatistics from './statistics/squads';
import formatGameType from './utils/formatGameType';
import { stopAllBarsProgress } from './utils/progressHandler';

const getParsedReplays = async (gameType: GameType): Promise<PlayersGameResultWithDate[]> => {
  const replays = await getReplays(gameType);
  const parsedReplays = await parseReplays(replays.slice(0, gameType === 'sg' ? 100 : 1000), gameType);

  return parsedReplays;
};

const countStatistics = (
  parsedReplays: PlayersGameResultWithDate[],
  gameType: GameType,
): Statistics => {
  const global = calculateGlobalStatistics(parsedReplays);
  const squad = calculateSquadStatistics(global);
  const byRotations = gameType === 'sg' ? getStatsByRotations(parsedReplays) : null;

  console.log(`- ${formatGameType(gameType)} statistics collected.`);

  return {
    global,
    squad,
    byRotations,
  };
};

(async () => {
  const [sgParsedReplays, maceParsedReplays] = await Promise.all(
    gameTypes.map((gameType) => getParsedReplays(gameType)),
  );

  stopAllBarsProgress();

  console.log('\nAll replays parsed, start collecting statistics:');

  const parsedReplays: Record<GameType, PlayersGameResultWithDate[]> = {
    sg: sgParsedReplays,
    mace: maceParsedReplays,
  };
  const [sgStats, maceStats] = await Promise.all(
    gameTypes.map((gameType) => countStatistics(parsedReplays[gameType], gameType)),
  );

  console.log('\nAll statistics collected, start generating output files.');

  generateOutput({
    sg: { ...sgStats },
    mace: { ...maceStats },
  });

  console.log('\nCompleted.');
})();
