import fs from 'fs';

import archiver from 'archiver';

import { statsFolder } from './consts';

const archiveFiles = () => {
  const output = fs.createWriteStream(`${statsFolder}/stats.zip`);
  const archive = archiver('zip');

  archive.pipe(output);
  archive.glob(`${statsFolder}/*.json`);
  archive.finalize();
};

export default archiveFiles;
