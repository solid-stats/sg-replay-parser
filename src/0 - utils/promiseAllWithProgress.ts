import { incrementBarValue, initializeProgressBar } from './progressHandler';

const promiseAllWithProgress = async <PromiseType>(
  promises: Promise<PromiseType>[],
  gameType: GameType,
): Promise<Awaited<PromiseType>[]> => {
  initializeProgressBar(gameType, promises.length);

  promises.forEach((promise) => promise.then(() => incrementBarValue(gameType)));

  return Promise.all(promises);
};

export default promiseAllWithProgress;
