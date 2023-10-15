import fs from 'fs-extra';

import { basicPaths } from './paths';

const generateBasicFolders = () => (
  basicPaths.forEach((dir) => {
    fs.ensureDirSync(dir);
  })
);

export default generateBasicFolders;
