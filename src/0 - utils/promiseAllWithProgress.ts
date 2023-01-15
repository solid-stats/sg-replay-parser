import { incrementBarValue, initializeProgressBar } from './progressHandler';

const promiseAllWithProgress = async <PromiseType>(
  promises: Promise<PromiseType>[],
  gameType: GameType,
): Promise<Awaited<PromiseType>[]> => {
  initializeProgressBar(gameType, promises.length);

  promises.forEach((promise) => promise.then(() => incrementBarValue(gameType)));

  const result = await Promise.all(promises);

  return result;
};

export default promiseAllWithProgress;
