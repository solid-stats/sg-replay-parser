import fs from 'fs';

import { rotationStatsDefaultFolder, statsFolder } from './consts';
import generateJSONOutput from './json';

const generateRotationJSONOutput = (
  statistics: StatisticsByRotation,
  index: number,
  folderName: FolderName,
) => {
  const folderPath = `${statsFolder}/${folderName}/${rotationStatsDefaultFolder}_${index + 1}`;

  fs.mkdirSync(folderPath);

  generateJSONOutput(statistics.stats, folderPath);
};

export default generateRotationJSONOutput;
