import { replaysListFileName } from '../../0 - consts';

const checks = (result: Output): void => {
  const replaysWithoutsFilename = result.problematicReplays.filter(
    (val) => val.filename.length === 0,
  );

  if (replaysWithoutsFilename.length > 0) {
    console.error(`
      Found replays without filename.
      Suggest find those replays in ${replaysListFileName} file in problematicReplays array and if its really don't have filename, then open ticket in a bugtracker https://solidgames.ru/bugtracker.
      If in fact there is a filename there then suggest to re-run job or open issue in github https://github.com/Afgan0r/sg-replay-parser/issues.
    `);
  }

  if (result.replays.length !== result.parsedReplays.length) {
    console.error('Length of the replays and parsedReplays not the same.');
  }
};

export default checks;
