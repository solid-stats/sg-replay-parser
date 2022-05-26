import cliProgress from 'cli-progress';

const promiseAllWithProgress = async <PromiseType>(
  promises: Promise<PromiseType>[],
): Promise<Awaited<PromiseType>[]> => {
  const progress = new cliProgress.SingleBar({
    format: 'Replays parsing progress | {bar} | {percentage}% | {value}/{total} replays | Duration: {duration_formatted} | ETA: {eta}s',
  }, cliProgress.Presets.shades_classic);

  progress.start(promises.length, 0);

  promises.forEach((promise) => promise.then(() => progress.increment()));

  const result = await Promise.all(promises);

  progress.stop();

  return result;
};

export default promiseAllWithProgress;
