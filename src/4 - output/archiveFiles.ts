import fs from 'fs';

import archiver from 'archiver';

import { statsFolder } from './consts';

const archiveFiles = (folders: string[]) => {
  const output = fs.createWriteStream(`${statsFolder}/stats.zip`);
  const archive = archiver('zip');

  archive.pipe(output);
  folders.forEach((folder) => archive.directory(`${statsFolder}/${folder}`, folder));
  archive.finalize();
};

export default archiveFiles;
