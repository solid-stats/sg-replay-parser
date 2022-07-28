import fs from 'fs';

import { statsFolder } from './consts';

const generateJSONOutput = (statistics: Statistics, folderName: string): void => {
  const folderPath = `${statsFolder}/${folderName}`;

  fs.mkdirSync(folderPath);

  const stats = {
    globalStatistics: statistics.global,
    squadStatistics: statistics.squad,
  };

  fs.writeFileSync(`${folderPath}/stats.json`, JSON.stringify(stats, null, '\t'));

  if (statistics.byRotations) {
    fs.writeFileSync(`${folderPath}/rotations_stats.json`, JSON.stringify(statistics.byRotations, null, '\t'));
  }
};

export default generateJSONOutput;
