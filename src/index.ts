import fs from 'fs';

import union from 'lodash/union';

import { gameTypes, getParsedReplaysPath } from './0 - consts';
import formatGameType from './0 - utils/formatGameType';
import { stopAllBarsProgress } from './0 - utils/progressHandler';
import getReplays from './1 - replays/getReplays';
import parseReplays from './1 - replays/parseReplays';
import calculateGlobalStatistics from './3 - statistics/global';
import getStatsByRotations from './3 - statistics/rotations';
import calculateSquadStatistics from './3 - statistics/squads';
import generateOutput from './4 - output';

const readAlreadyParsedReplaysFile = (gameType: GameType): AlreadyParsedReplays | null => {
  try {
    return JSON.parse(fs.readFileSync(getParsedReplaysPath(gameType), 'utf8'));
  } catch {
    return null;
  }
};

const getParsedReplays = async (
  gameType: GameType,
  alreadyParsedReplays: AlreadyParsedReplays,
): Promise<PlayersGameResultWithDate[]> => {
  const replays = await getReplays(gameType, alreadyParsedReplays);
  const parsedReplays = await parseReplays(replays, gameType);

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
  const [alreadyParsedSGReplays, alreadyParsedMaceReplays] = gameTypes.map((gameType) => (
    readAlreadyParsedReplaysFile(gameType)
  ));

  const alreadyParsedReplays: Record<GameType, AlreadyParsedReplays> = {
    sg: alreadyParsedSGReplays ?? [],
    mace: alreadyParsedMaceReplays ?? [],
  };

  Object.keys(alreadyParsedReplays).forEach((gameType: GameType) => {
    const ids = alreadyParsedReplays[gameType];

    if (ids && ids.length > 0) {
      console.log(`Found ${ids.length} already parsed ${formatGameType(gameType)} replays.`);
    }
  });

  console.log('');

  const [sgParsedReplays, maceParsedReplays] = await Promise.all(
    gameTypes.map((gameType) => getParsedReplays(gameType, alreadyParsedReplays[gameType])),
  );

  const parsedSGReplays: AlreadyParsedReplays = sgParsedReplays.map((mission) => mission.id);
  const parsedMaceReplays: AlreadyParsedReplays = maceParsedReplays.map((mission) => mission.id);

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

  generateOutput(
    {
      sg: { ...sgStats },
      mace: { ...maceStats },
    },
    {
      sg: union(alreadyParsedSGReplays, parsedSGReplays),
      mace: union(alreadyParsedMaceReplays, parsedMaceReplays),
    },
  );

  console.log('\nCompleted.');
})();
