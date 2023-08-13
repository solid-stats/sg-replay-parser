import fs from 'fs';

import { parse } from 'csv-parse/sync';
import { isEmpty } from 'lodash';
import { v4 as uuid } from 'uuid';

import { getNamesList, setNamesList } from '.';

import { nameChangesPath } from '../../0 - consts';
import { dayjsUTC, dayjsUnix } from '../dayjs';
import pipe from '../pipe';
import { findNameInfo } from './findNameInfo';
import moscowDateToUTC from './moscowDateToUTC';
import { dateFormat } from './utils/consts';
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
  try {
    return fs.readFileSync(nameChangesPath, 'utf8');
  } catch {
    // eslint-disable-next-line no-console
    console.log('CSV файл с историей смен ников не найден');

    return '';
  }
};
const filter = (records: RawCSVContentType[]) => records.filter(
  //                             accepted
  (record) => record.Статус === 'Принято',
);
const order = (records: RawCSVContentType[]) => (
  records.sort((first, second) => (
    dayjsUTC(first['Дата смены ника'], dateFormat)
      .isAfter(dayjsUTC(second['Дата смены ника'], dateFormat)) ? 1 : -1
  ))
);

export const prepareNamesList = (): void => {
  const namesList = getNamesList();

  if (namesList) return;

  const newNamesList: NamesList = {};

  const fileContent = readCSCFile();

  if (!fileContent) {
    setNamesList({});

    return;
  }

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as RawCSVContentType[];

  const processedRecords = pipe(filter, order)(records);

  processedRecords.forEach((record) => {
    let oldName = record['Старый позывной'].toLowerCase();
    let newName = record['Новый позывной'].toLowerCase();

    const date = moscowDateToUTC(record['Дата смены ника']);
    const formattedDate = date.format(dateFormat);

    const oldNameInfo = findNameInfo(newNamesList, oldName, date);
    const id = oldNameInfo ? oldNameInfo.info.id : uuid();

    const existingNames = Object.keys(newNamesList).filter((name) => name.includes(newName));

    if (!isEmpty(existingNames)) newName = `${newName}_${existingNames.length}`;
    else { newName = `${newName}_0`; }

    oldName = oldNameInfo ? `${oldName}_${oldNameInfo.indexInfo.listIndex}` : `${oldName}_0`;

    if (!oldNameInfo) {
      newNamesList[oldName] = {
        id,
        fromDate: dayjsUnix(1).format(dateFormat),
        endDate: formattedDate,
      };

      newNamesList[newName] = {
        id,
        fromDate: formattedDate,
        endDate: dayjsUTC('2100-01-01').endOf('day').format(dateFormat),
      };
    } else {
      newNamesList[oldName] = {
        id,
        fromDate: oldNameInfo.info.fromDate,
        endDate: formattedDate,
      };

      newNamesList[newName] = {
        id,
        fromDate: formattedDate,
        endDate: dayjsUTC('2100-01-01').endOf('day').format(dateFormat),
      };
    }
  });

  setNamesList(newNamesList);
};
