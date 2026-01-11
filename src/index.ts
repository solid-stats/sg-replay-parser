import fs from 'fs-extra';

import { gameTypes } from './0 - consts/gameTypesArray';
import { dayjsUTC } from './0 - utils/dayjs';
import filterPlayersByTotalPlayedGames from './0 - utils/filterPlayersByTotalPlayedGames';
import formatGameType from './0 - utils/formatGameType';
import generateBasicFolders from './0 - utils/generateBasicFolders';
import logger from './0 - utils/logger';
import { prepareNamesList } from './0 - utils/namesHelper/prepareNamesList';
import { tempResultsPath } from './0 - utils/paths';
import getReplays from './1 - replays/getReplays';
import parseReplays from './1 - replays/parseReplays';
import calculateGlobalStatistics from './3 - statistics/global';
import getStatsByRotations from './3 - statistics/rotations';
import generateOutput from './4 - output';

const getParsedReplays = async (gameType: GameType): Promise<PlayersGameResult[]> => {
  let replays = await getReplays(gameType);

  if (gameType === 'sm') {
    replays = replays.filter(
      (replay) => dayjsUTC(replay.date).isAfter('2023-01-01', 'month'),
    );
  }

  const parsedReplays = await parseReplays(replays, gameType);

  // used only in development
  // const parsedReplays = await parseReplays(
  //   gameType === 'sg' ? replays.slice(0, 100) : [],
  //   gameType,
  // );

  return parsedReplays;
};

const countStatistics = (
  parsedReplays: PlayersGameResult[],
  gameType: GameType,
): Statistics => {
  const global = calculateGlobalStatistics(parsedReplays);
  const byRotations = gameType === 'sg' ? getStatsByRotations(parsedReplays) : null;

  logger.info(`- ${formatGameType(gameType)} statistics collected.`);

  return {
    global: filterPlayersByTotalPlayedGames({
      statistics: global,
      gamesCount: parsedReplays.length,
      type: 'not show',
    }),
    squad: [],
    squadFull: [],
    byRotations,
  };
};

const startParsingReplays = async () => {
  generateBasicFolders();
  fs.emptyDirSync(tempResultsPath);
  prepareNamesList();

  logger.info('Started parsing replays.');

  const [sgParsedReplays, maceParsedReplays, smParsedReplays] = await Promise.all(
    gameTypes.map((gameType) => getParsedReplays(gameType)),
  );

  logger.info('All replays parsed, start collecting statistics:');

  const parsedReplays: Record<GameType, PlayersGameResult[]> = {
    sg: sgParsedReplays,
    mace: maceParsedReplays,
    sm: smParsedReplays,
  };
  const [sgStats, maceStats, smStats] = await Promise.all(
    gameTypes.map((gameType) => countStatistics(parsedReplays[gameType], gameType)),
  );

  logger.info('All statistics collected, start generating output files.');

  await generateOutput({
    sg: { ...sgStats },
    mace: { ...maceStats },
    sm: { ...smStats },
  });

  logger.info('Replays parsing completed.');
};

export default startParsingReplays;
