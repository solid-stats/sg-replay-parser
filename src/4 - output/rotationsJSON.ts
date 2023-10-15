import path from 'path';

import fs from 'fs-extra';

import { tempResultsDir } from '../0 - utils/dirs';
import { rotationStatsDefaultFolder } from './consts';
import generateJSONOutput from './json';

const generateRotationJSONOutput = (
  statistics: StatisticsByRotation,
  index: number,
  folderName: FolderName,
) => {
  const folderPath = path.join(tempResultsDir, folderName, `${rotationStatsDefaultFolder}_${index + 1}`);

  fs.mkdirSync(folderPath);

  generateJSONOutput(statistics.stats, folderPath);
};

export default generateRotationJSONOutput;
