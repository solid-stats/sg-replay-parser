import fs from 'fs';

import archiveFiles from './archiveFiles';
import { statsByWeeksFolder, statsFolder } from './consts';
import generateJSONOutput from './jsonOutput';
import { generateMarkdownTable, generateMarkdownTablesByWeek } from './markdownOutput';

const generateOutput = (statistics: GlobalPlayerStatistics[]): void => {
  fs.mkdirSync(statsFolder);
  fs.mkdirSync(statsByWeeksFolder);
  generateMarkdownTable(statistics);
  generateMarkdownTablesByWeek(statistics);
  generateJSONOutput(statistics);
  archiveFiles();
};

export default generateOutput;
