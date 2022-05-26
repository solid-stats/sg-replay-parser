import cliProgress from 'cli-progress';

const promiseAllWithProgress = async <PromiseType>(
  promises: Promise<PromiseType>[],
): Promise<Awaited<PromiseType>[]> => {
  const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
  let progressValue = 0;

  console.log('Parsing started.');

  progress.start(promises.length, progressValue);

  promises.forEach((promise) => {
    promise.then(() => {
      progressValue += 1;
      progress.update(progressValue);
    });
  });

  const result = await Promise.all(promises);

  progress.stop();

  return result;
};

export default promiseAllWithProgress;
