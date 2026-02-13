import fs from 'fs-extra';

import logger from '../../0 - utils/logger';
import { resetNamesList } from '../../0 - utils/namesHelper';
import { configPath, nameChangesPath } from '../../0 - utils/paths';
import request from '../../0 - utils/request';

const nameChangesCsvURL = 'https://docs.google.com/spreadsheets/d/1d2XHhGC0S0QgSegwL4HF279PLjH6fJzPJfTVLSrgpGQ/gviz/tq?tqx=out:csv&sheet=%D0%9F%D0%B5%D1%80%D0%B5%D0%BD%D0%BE%D1%81%20%D1%81%D1%82%D0%B0%D1%82%D0%B8%D1%81%D1%82%D0%B8%D0%BA%D0%B8%20%D0%BD%D0%B0%20%D0%BD%D0%BE%D0%B2%D1%8B%D0%B9%20%D0%BF%D0%BE%D0%B7%D1%8B%D0%B2%D0%BD%D0%BE%D0%B9';

const updateNameChangesCsv = async (): Promise<void> => {
  try {
    const response = await request(nameChangesCsvURL);

    if (!response) {
      logger.error('Error during nameChanges.csv update. Empty response received.');

      return;
    }

    const csvContent = await response.text();

    fs.ensureDirSync(configPath);
    fs.writeFileSync(nameChangesPath, csvContent, 'utf8');
    resetNamesList();
    logger.info(`nameChanges.csv updated successfully: ${nameChangesPath}`);
  } catch (err) {
    logger.error(`Error during nameChanges.csv update. Trace: ${(err as Error).stack}`);
  }
};

export default updateNameChangesCsv;
