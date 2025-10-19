import path from 'path';

import { parse } from 'csv-parse/sync';
import { Dayjs } from 'dayjs';
import fs from 'fs-extra';
import { isEmpty } from 'lodash';
import { v4 as uuid } from 'uuid';
import z from 'zod';

import { getNamesList, setNamesList } from '.';

import { dayjsUTC, dayjsUnix } from '../dayjs';
import logger from '../logger';
import { configPath } from '../paths';
import { findNameInfo } from './findNameInfo';
import moscowDateToUTC from './moscowDateToUTC';
import { dateFormat, delimiter } from './utils/consts';
import { NamesList } from './utils/types';

// accepted | declined
type StatusRU = 'Принято' | 'Отказано';

export type RawCSVContentType = {
  'Старый позывной': string;
  'Новый позывной': string;
  'Дата смены ника': string;
  'Статус': StatusRU;
};
type CSVContentType = {
  oldName: string;
  newName: string;
  date: Dayjs;
};

const readCSVFile = () => {
  const nameChangesPath = path.join(configPath, 'nameChanges.csv');

  try {
    return fs.readFileSync(nameChangesPath, 'utf8');
  } catch (e) {
    logger.error(`Error occurred during reading ${nameChangesPath} file. Trace: ${e.stack}`);

    return '';
  }
};

type GetTimeReturn = { hours: number, minutes: number };
const getTime = (rawTime: string): GetTimeReturn | undefined => {
  const [hours, minutes] = rawTime.split(':');

  try {
    return {
      hours: z.coerce.number().parse(hours),
      minutes: z.coerce.number().parse(minutes),
    };
  } catch {
    return undefined;
  }
};
const parseDate = (rawDate: string): Dayjs | undefined => {
  const [date, rawTime] = rawDate.split(' ');

  const [day, month, year] = date.split('.');
  const time = getTime(rawTime);

  if (!time) return undefined;

  try {
    const parsedDate = [
      [
        z.coerce.number().parse(day),
        z.coerce.number().parse(month),
        z.coerce.number().parse(year),
      ].join('.'),
      [
        z.coerce.number().parse(time.hours),
        z.coerce.number().parse(time.minutes),
      ].join(':'),
    ].join(' ');

    return moscowDateToUTC(parsedDate, 'D.M.YYYY H:m');
  } catch {
    return undefined;
  }
};
const processContent = (records: RawCSVContentType[]): CSVContentType[] => (
  records
    .map<CSVContentType | undefined>(
    (record) => {
      const date = parseDate(record['Дата смены ника']);

      if (date === undefined || record.Статус === 'Отказано') return undefined;

      return {
        oldName: record['Старый позывной'],
        newName: record['Новый позывной'],
        date,
      };
    },
  )
    .filter((value): value is CSVContentType => Boolean(value))
);
const order = (records: CSVContentType[]) => (
  records.sort(
    (first, second) => (
      first.date.isAfter(second.date)
        ? 1
        : -1
    ),
  )
);

export const prepareNamesList = (): void => {
  const namesList = getNamesList();

  if (namesList) return;

  const newNamesList: NamesList = {};

  const fileContent = readCSVFile();

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  const processedRecords = order(processContent(records));

  processedRecords.forEach((record) => {
    const originalOldName = record.oldName.trim();
    const originalNewName = record.newName.trim();
    let oldName = originalOldName.toLowerCase();
    let newName = originalNewName.toLowerCase();

    const formattedDate = record.date.format(dateFormat);

    const oldNameInfo = findNameInfo(newNamesList, oldName, record.date);
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
