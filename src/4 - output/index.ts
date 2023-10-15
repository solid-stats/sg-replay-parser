import path from 'path';

import fs from 'fs-extra';
import { omit, pick } from 'lodash';

import { resultsDir, tempResultsDir } from '../0 - utils/dirs';
import archiveFiles from './archiveFiles';
import { allTimeFolder, rotationsGeneralInfoFileName } from './consts';
import generateJSONOutput from './json';
import generateRotationJSONOutput from './rotationsJSON';

const generateOutput = async (statistics: StatisticsForOutput): Promise<void> => {
  const folderNames = Object.keys(statistics) as FolderName[];

  folderNames.forEach((folderName) => {
    const folderPath = path.join(tempResultsDir, folderName);
    const allTimeFolderPath = path.join(folderPath, allTimeFolder);
    const rotationsStats = statistics[folderName].byRotations;
    const generalRotationsStats: GeneralRotationInfo[] = [];

    fs.mkdirSync(folderPath);

    if (rotationsStats) fs.mkdirSync(allTimeFolderPath);

    generateJSONOutput(pick(statistics[folderName], ['global', 'squad']), rotationsStats ? allTimeFolderPath : folderPath);

    if (rotationsStats) {
      rotationsStats.forEach((rotation, index) => {
        generalRotationsStats.push(omit(rotation, 'stats'));
        generateRotationJSONOutput(rotation, index, folderName);
      });
    }

    fs.writeFileSync(
      path.join(folderPath, rotationsGeneralInfoFileName),
      JSON.stringify(generalRotationsStats, null, '\t'),
    );
  });

  await archiveFiles(folderNames);

  fs.rmdirSync(resultsDir, { recursive: true });
  fs.moveSync(tempResultsDir, resultsDir);
};

export default generateOutput;
