import cliProgress from 'cli-progress';

const promiseAllWithProgress = <PromiseType>(
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

  return Promise.all(promises);
};

export default promiseAllWithProgress;
