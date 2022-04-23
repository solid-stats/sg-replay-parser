import fs from 'fs';

import archiveFiles from './archiveFiles';
import { statsByWeeksFolder, statsFolder } from './consts';
import generateReadmeFile from './generateReadmeFile';
import generateJSONOutput from './jsonOutput';
import { generateMarkdownTable, generateMarkdownTablesByWeek } from './markdownOutput';

const generateOutput = (statistics: StatisticsForOutput): void => {
  fs.mkdirSync(statsFolder);
  fs.mkdirSync(statsByWeeksFolder);
  generateMarkdownTable(statistics);
  generateMarkdownTablesByWeek(statistics);
  generateJSONOutput(statistics);
  generateReadmeFile();
  archiveFiles();
};

export default generateOutput;
