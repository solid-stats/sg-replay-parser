import fs from 'fs';

import archiver from 'archiver';

import {
  readmeFileName, readmeFilePath, statsByWeeksFolder, statsByWeeksFolderName, statsFolder,
} from './consts';

const archiveFiles = () => {
  const output = fs.createWriteStream(`${statsFolder}/stats.zip`);
  const archive = archiver('zip');

  archive.pipe(output);
  archive.file(`${statsFolder}/stats.json`, { name: 'stats.json' });
  archive.file(`${statsFolder}/stats.md`, { name: 'stats.md' });
  archive.file(readmeFilePath, { name: readmeFileName });
  archive.directory(statsByWeeksFolder, statsByWeeksFolderName);
  archive.finalize();
};

export default archiveFiles;
