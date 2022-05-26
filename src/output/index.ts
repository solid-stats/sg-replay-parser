import fs from 'fs';

import archiveFiles from './archiveFiles';
import { statsFolder } from './consts';
import generateJSONOutput from './json';

const generateOutput = (statistics: StatisticsForOutput): void => {
  const folderNames = Object.keys(statistics);

  fs.mkdirSync(statsFolder);
  folderNames.forEach((folderName) => {
    generateJSONOutput(statistics[folderName], folderName);
  });
  archiveFiles(folderNames);
};

export default generateOutput;
