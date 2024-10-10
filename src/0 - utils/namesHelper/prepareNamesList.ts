import path from 'path';

import { parse } from 'csv-parse/sync';
import fs from 'fs-extra';
import { isEmpty } from 'lodash';
import { v4 as uuid } from 'uuid';

import { getNamesList, setNamesList } from '.';

import { dayjsUTC, dayjsUnix } from '../dayjs';
import logger from '../logger';
import { configPath } from '../paths';
import pipe from '../pipe';
import { findNameInfo } from './findNameInfo';
import moscowDateToUTC from './moscowDateToUTC';
import { dateFormat, delimiter, nameChangeDateFormat } from './utils/consts';
import { NamesList } from './utils/types';

// accepted | declined
type StatusRU = 'Принято' | 'Отказано';

export type RawCSVContentType = {
  'Старый позывной': string,
  'Новый позывной': string,
  'Дата смены ника': string,
  'Статус': StatusRU,
};

const readCSCFile = () => {
  const nameChangesPath = path.join(configPath, 'nameChanges.csv');

  try {
    return fs.readFileSync(nameChangesPath, 'utf8');
  } catch (e) {
    logger.error(`Error occurred during reading ${nameChangesPath} file. Trace: ${e.stack}`);

    return '';
  }
};
const filter = (records: RawCSVContentType[]) => records.filter(
  //                             accepted
  (record) => record.Статус === 'Принято',
);
const order = (records: RawCSVContentType[]) => (
  records.sort((first, second) => {
    const firstDate = dayjsUTC(first['Дата смены ника'], nameChangeDateFormat);
    const secondDate = dayjsUTC(second['Дата смены ника'], nameChangeDateFormat);

    return firstDate.isAfter(secondDate) ? 1 : -1;
  })
);

export const prepareNamesList = (): void => {
  const namesList = getNamesList();

  if (namesList) return;

  const newNamesList: NamesList = {};

  const fileContent = readCSCFile();

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as RawCSVContentType[];

  const processedRecords = pipe(filter, order)(records);

  processedRecords.forEach((record) => {
    const originalOldName = record['Старый позывной'].trim();
    const originalNewName = record['Новый позывной'].trim();
    let oldName = originalOldName.toLowerCase();
    let newName = originalNewName.toLowerCase();

    const date = moscowDateToUTC(record['Дата смены ника']);
    const formattedDate = date.format(dateFormat);

    const oldNameInfo = findNameInfo(newNamesList, oldName, date);
    const id = oldNameInfo ? oldNameInfo.info.id : uuid();

    const existingNames = Object.keys(newNamesList).filter((name) => name.includes(newName));

    if (!isEmpty(existingNames)) newName = `${newName}${delimiter}${existingNames.length}`;
    else { newName = `${newName}${delimiter}0`; }

    oldName = oldNameInfo ? `${oldName}${delimiter}${oldNameInfo.indexInfo.listIndex}` : `${oldName}${delimiter}0`;

    if (!oldNameInfo) {
      newNamesList[oldName] = {
        id,
        name: originalOldName,
        fromDate: dayjsUnix(1).format(dateFormat),
        endDate: formattedDate,
      };

      newNamesList[newName] = {
        id,
        name: originalNewName,
        fromDate: formattedDate,
        endDate: dayjsUTC('2100-01-01').endOf('day').format(dateFormat),
      };
    } else {
      newNamesList[oldName] = {
        id,
        name: originalOldName,
        fromDate: oldNameInfo.info.fromDate,
        endDate: formattedDate,
      };

      newNamesList[newName] = {
        id,
        name: originalNewName,
        fromDate: formattedDate,
        endDate: dayjsUTC('2100-01-01').endOf('day').format(dateFormat),
      };
    }
  });

  setNamesList(newNamesList);
};
