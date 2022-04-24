import fs from 'fs';

import archiveFiles from './archiveFiles';
import { statsBySquadFolder, statsByWeeksFolder, statsFolder } from './consts';
import generateReadmeFile from './generateReadmeFile';
import generateJSONOutput from './json';
import generateMarkdownOutput from './markdown';

const generateOutput = (statistics: StatisticsForOutput): void => {
  fs.mkdirSync(statsFolder);
  fs.mkdirSync(statsByWeeksFolder);
  fs.mkdirSync(statsBySquadFolder);
  generateJSONOutput(statistics);
  generateMarkdownOutput(statistics);
  generateReadmeFile();
  archiveFiles();
};

export default generateOutput;
