import fs from 'fs-extra';

import { basicDirs } from './dirs';

const generateBasicFolders = () => (
  basicDirs.forEach((dir) => {
    fs.ensureDirSync(dir);
  })
);

export default generateBasicFolders;
