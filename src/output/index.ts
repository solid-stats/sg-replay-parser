import fs from 'fs';

import archiveFiles from './archiveFiles';
import { statsBySquadFolder, statsByWeeksFolder, statsFolder } from './consts';
import generateReadmeFile from './generateReadmeFile';
import generateJSONOutput from './jsonOutput';
import {
  generateMarkdownTable,
  generateMarkdownTableForSquads,
  generateMarkdownTablesBySquad,
  generateMarkdownTablesByWeek,
} from './markdownOutput';

const generateOutput = (statistics: StatisticsForOutput): void => {
  fs.mkdirSync(statsFolder);
  fs.mkdirSync(statsByWeeksFolder);
  fs.mkdirSync(statsBySquadFolder);
  generateMarkdownTable(statistics);
  generateMarkdownTableForSquads(statistics);
  generateMarkdownTablesBySquad(statistics);
  generateMarkdownTablesByWeek(statistics);
  generateJSONOutput(statistics);
  generateReadmeFile();
  archiveFiles();
};

export default generateOutput;
