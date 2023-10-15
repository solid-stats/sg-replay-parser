import { replaysListPath } from '../../../0 - utils/paths';
import logger from '../../../0 - utils/logger';

const checks = (result: Output): void => {
  const replaysWithoutsFilename = result.problematicReplays.filter(
    (val) => val.filename.length === 0,
  );

  if (replaysWithoutsFilename.length > 0) {
    logger.error(
      `
Found replays without filename.
Suggest finding those replays in ${replaysListPath} file in problematicReplays array and if its really don't have filename, then open ticket in a bugtracker https://sg.zone/bugtracker.
If in fact there is a filename there then suggest to re-run job or open issue in github https://github.com/Afgan0r/sg-replay-parser/issues.`,
    );
  }

  if (result.replays.length !== result.parsedReplays.length) {
    logger.error('Length of the replays and parsedReplays not the same.');
  }
};

export default checks;
