import fs from 'fs';

import { omit, pick } from 'lodash';

import archiveFiles from './archiveFiles';
import { allTimeFolder, rotationsGeneralInfoFileName, statsFolder } from './consts';
import generateJSONOutput from './json';
import generateRotationJSONOutput from './rotationsJSON';

const generateOutput = (statistics: StatisticsForOutput): void => {
  const folderNames = Object.keys(statistics) as FolderName[];

  fs.mkdirSync(statsFolder);

  folderNames.forEach((folderName) => {
    const folderPath = `${statsFolder}/${folderName}`;
    const allTimeFolderPath = `${folderPath}/${allTimeFolder}`;
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

    fs.writeFileSync(`${folderPath}/${rotationsGeneralInfoFileName}`, JSON.stringify(generalRotationsStats, null, '\t'));
  });
  archiveFiles(folderNames);
};

export default generateOutput;
