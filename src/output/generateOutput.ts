import fs from 'fs';

import archiver from 'archiver';

import { statsByWeeksFolder, statsFolder } from './consts';
import generateJSONOutput from './jsonOutput';
import { generateMarkdownTable, generateMarkdownTablesByWeek } from './markdownOutput';

const generateOutput = (statistics: GlobalPlayerStatistics[]): void => {
  fs.mkdirSync(statsFolder);
  fs.mkdirSync(statsByWeeksFolder);
  generateMarkdownTable(statistics);
  generateMarkdownTablesByWeek(statistics);
  generateJSONOutput(statistics);

  const output = fs.createWriteStream(`${statsFolder}/stats.zip`);
  const archive = archiver('zip');

  archive.pipe(output);
  archive.directory('output', false);
  archive.finalize();
};

export default generateOutput;
