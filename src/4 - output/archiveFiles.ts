import fs from 'fs';

import archiver from 'archiver';

import { outputFolder } from '../0 - consts';

const archiveFiles = (folders: string[]) => {
  const output = fs.createWriteStream(`${outputFolder}/stats.zip`);
  const archive = archiver('zip');

  archive.pipe(output);
  folders.forEach((folder) => archive.directory(`${outputFolder}/${folder}`, folder));
  archive.finalize();
};

export default archiveFiles;
