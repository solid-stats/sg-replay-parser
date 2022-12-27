import fs from 'fs';
import { URL } from 'url';

import { parse } from 'csv-parse/sync';
import { trim } from 'lodash';

import { requestsFilePath } from '../../0 - consts';
import { getPlayerName } from '../../0 - utils/getPlayerName';

let parsedCSV: GameResultsChangeRequest[] | null = null;

type RawCSVContentType = {
  'Реплей': ReplayLink;
  'Тип запроса': ChangeResuestTypesRU;
  'Позывной': PlayerName;
  'Затронутые игроки': string; // affected players
};

const ResuestTypesRUtoEN: Record<ChangeResuestTypesRU, ChangeResuestTypesEN> = {
  'Добавить одно или несколько убийств': 'add_kill',
  'Добавить один или несколько тимкиллов': 'add_teamkill',
  'Добавить уничтожение техники': 'add_vehicle_kill',
  'Убрать один или несколько тимкиллов': 'remove_teamkill',
  'Удалить игрока из игры': 'remove_from_game',
};

const readCSVFile = () => {
  try {
    return fs.readFileSync(requestsFilePath, 'utf8');
  } catch {
    return '';
  }
};

const processAffectedPlayers = (affectedPlayers: string): GameResultsChangeRequest['affectedPlayers'] => {
  if (affectedPlayers.includes(';')) return affectedPlayers.split(';').map(trim).map(getPlayerName);

  if (!affectedPlayers) return [];

  return [getPlayerName(affectedPlayers)];
};

const parseCSV = (): GameResultsChangeRequest[] => {
  if (parsedCSV !== null) return parsedCSV;

  const fileContent = readCSVFile();

  if (!fileContent) return [];

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as RawCSVContentType[];
  const requests: GameResultsChangeRequest[] = records.map((record) => ({
    replayLink: new URL(record.Реплей, 'https://solidgames.ru/').pathname as ReplayLink,
    type: ResuestTypesRUtoEN[record['Тип запроса']],
    requestedPlayer: getPlayerName(record.Позывной),
    affectedPlayers: processAffectedPlayers(record['Затронутые игроки']),
  }));

  parsedCSV = requests;

  return requests;
};

export default parseCSV;
