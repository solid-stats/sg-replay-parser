import cliProgress, { SingleBar } from 'cli-progress';

import { gameTypes } from '../consts';
import formatGameType from './formatGameType';

const getLabel = (gameType: string) => `Parsing ${gameType} replays`;

const progress = new cliProgress.MultiBar({
  format: '{gameTypeLabel} | {bar} {percentage}% | ETA: {eta}s | {value}/{total} replays',
  fps: 30,
  etaBuffer: 50,
  hideCursor: true,
}, cliProgress.Presets.shades_classic);

const bars: Record<GameType, SingleBar | null> = { sg: null, mace: null };

const formatGameTypeLength = (formattedGameType: FormattedGameType) => {
  const label = getLabel(formattedGameType);
  const maxLength = Math.max(...gameTypes.map((gameType) => getLabel(gameType).length));
  const diff = maxLength - label.length;

  if (diff === 0) return label;

  let resultString = label;

  for (let i = 0; i < diff; i += 1) {
    resultString += ' ';
  }

  return resultString;
};

const isInitialized = (gameType: GameType): boolean => {
  const isNotInitialized = bars[gameType] === null;

  if (isNotInitialized) throw new Error('Progress bar is not initialized');

  return true;
};

export const initializeProgressBar = (gameType: GameType, totalGamesCount: number): void => {
  bars[gameType] = progress.create(totalGamesCount, 0, {
    gameTypeLabel: formatGameTypeLength(formatGameType(gameType)),
  });
};

export const incrementBarValue = (gameType: GameType): void => {
  if (!isInitialized(gameType)) return;

  bars[gameType]?.increment();
};

export const stopAllBarsProgress = (): void => {
  progress.stop();
};
