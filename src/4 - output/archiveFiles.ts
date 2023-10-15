import path from 'path';

import archiver from 'archiver';
import fs from 'fs-extra';

import { tempResultsDir } from '../0 - utils/dirs';

const archiveFiles = async (folders: string[]) => {
  const output = fs.createWriteStream(path.join(tempResultsDir, 'stats.zip'));
  const archive = archiver('zip');

  archive.pipe(output);
  folders.forEach((folder) => archive.directory(path.join(tempResultsDir, folder), folder));
  await archive.finalize();
};

export default archiveFiles;
