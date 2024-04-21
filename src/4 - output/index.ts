import path from 'path';

import fs from 'fs-extra';
import { omit, pick } from 'lodash';

import { resultsPath, tempResultsPath } from '../0 - utils/paths';
import archiveFiles from './archiveFiles';
import { allTimeFolder, rotationsGeneralInfoFileName } from './consts';
import generateJSONOutput from './json';
import generateRotationJSONOutput from './rotationsJSON';

const generateOutput = async (statistics: StatisticsForOutput): Promise<void> => {
  const folderNames = Object.keys(statistics) as FolderName[];

  folderNames.forEach((folderName) => {
    const folderPath = path.join(tempResultsPath, folderName);
    const allTimeFolderPath = path.join(folderPath, allTimeFolder);
    const rotationsStats = statistics[folderName].byRotations;
    const generalRotationsStats: GeneralRotationInfo[] = [];

    fs.mkdirSync(folderPath);

    if (rotationsStats) fs.mkdirSync(allTimeFolderPath);

    generateJSONOutput(
      pick(statistics[folderName], ['global', 'squad', 'squadFull']),
      rotationsStats ? allTimeFolderPath : folderPath,
    );

    if (rotationsStats) {
      rotationsStats.forEach((rotation, index) => {
        generalRotationsStats.push(omit(rotation, 'stats'));
        generateRotationJSONOutput(rotation, index, folderName);
      });

      fs.writeFileSync(
        path.join(folderPath, rotationsGeneralInfoFileName),
        JSON.stringify(generalRotationsStats, null, '\t'),
      );
    }
  });

  await archiveFiles(folderNames);

  fs.removeSync(resultsPath);
  fs.moveSync(tempResultsPath, resultsPath);
};

export default generateOutput;
