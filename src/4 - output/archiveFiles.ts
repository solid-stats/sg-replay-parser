import path from 'path';

import archiver from 'archiver';
import fs from 'fs-extra';

import { tempResultsPath } from '../0 - utils/paths';

const archiveFiles = async (folders: string[]) => {
  const output = fs.createWriteStream(path.join(tempResultsPath, 'stats.zip'));
  const archive = archiver('zip');

  archive.pipe(output);
  folders.forEach((folder) => archive.directory(path.join(tempResultsPath, folder), folder));
  await archive.finalize();
};

export default archiveFiles;
