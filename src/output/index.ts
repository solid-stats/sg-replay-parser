import fs from 'fs';

import archiveFiles from './archiveFiles';
import { statsFolder } from './consts';
import generateJSONOutput from './json';

const generateOutput = (statistics: StatisticsForOutput): void => {
  fs.mkdirSync(statsFolder);
  Object.keys(statistics).forEach((statsKey) => {
    generateJSONOutput(statistics[statsKey], statsKey);
  });
  archiveFiles();
};

export default generateOutput;
