import path from 'path';

import fs from 'fs-extra';

import { tempResultsPath } from '../0 - utils/paths';
import { rotationStatsDefaultFolder } from './consts';
import generateJSONOutput from './json';

const generateRotationJSONOutput = (
  statistics: StatisticsByRotation,
  index: number,
  folderName: FolderName,
) => {
  const folderPath = path.join(tempResultsPath, folderName, `${rotationStatsDefaultFolder}_${index + 1}`);

  fs.mkdirSync(folderPath);

  generateJSONOutput(statistics.stats, folderPath);
};

export default generateRotationJSONOutput;
