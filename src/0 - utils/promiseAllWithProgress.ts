import { incrementBarValue, initializeProgressBar, stopAllBarsProgress } from './progressHandler';

const promiseAllWithProgress = async <PromiseType>(
  promises: Promise<PromiseType>[],
  gameType: GameType,
): Promise<Awaited<PromiseType>[]> => {
  initializeProgressBar(gameType, promises.length);

  promises.forEach((promise) => promise.then(() => incrementBarValue(gameType)));

  const result = await Promise.all(promises);

  stopAllBarsProgress();

  return result;
};

export default promiseAllWithProgress;
