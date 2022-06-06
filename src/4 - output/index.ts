import fs from 'fs';

import { outputFolder, parsedReplaysFileName } from '../0 - consts';
import createFolder from '../0 - utils/createFolder';
import archiveFiles from './archiveFiles';
import generateJSONOutput from './json';

const generateOutput = (
  statistics: StatisticsForOutput,
  parsedReplays: ParsedReplays,
): void => {
  createFolder(outputFolder);

  const folderNames = Object.keys(statistics);

  folderNames.forEach((folderName) => {
    generateJSONOutput(statistics[folderName], folderName);
  });
  folderNames.forEach((folderName) => {
    fs.writeFileSync(`${outputFolder}/${folderName}/${parsedReplaysFileName}`, JSON.stringify(parsedReplays[folderName], null, '\t'));
  });
  archiveFiles(folderNames);
};

export default generateOutput;
