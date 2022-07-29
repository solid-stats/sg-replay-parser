import cliProgress, { SingleBar } from 'cli-progress';

import formatGameType from './formatGameType';

let isDisabled = false;

const getLabel = (gameType: string) => `Parsing ${gameType} replays`;

const progress = new cliProgress.MultiBar({
  format: '{gameTypeLabel} | {bar} {percentage}% | ETA: {eta}s | {value}/{total} replays',
  fps: 30,
  etaBuffer: 50,
  hideCursor: true,
}, cliProgress.Presets.shades_classic);

const bars: Record<GameType, SingleBar | null> = { sg: null, mace: null };

const isInitialized = (gameType: GameType): boolean => {
  const isNotInitialized = bars[gameType] === null;

  if (isNotInitialized) return false;

  return true;
};

export const initializeProgressBar = (gameType: GameType, totalGamesCount: number): void => {
  if (isDisabled) return;

  bars[gameType] = progress.create(totalGamesCount, 0, {
    gameTypeLabel: getLabel(formatGameType(gameType)),
  });
};

export const incrementBarValue = (gameType: GameType): void => {
  if (!isInitialized(gameType) || isDisabled) return;

  bars[gameType]?.increment();
};

export const stopAllBarsProgress = (): void => {
  progress.stop();
};

export const disableBarsProgress = (): void => { isDisabled = true; };
