import { readFile } from 'fs/promises';

import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { getDbClient } from '../client';

dayjs.extend(customParseFormat);
dayjs.extend(timezone);
dayjs.extend(utc);

type StatusRU = 'Принято' | 'Отказано';

interface RawCSVRecord {
  oldName: string;
  newName: string;
  date: string;
  status: StatusRU;
}

interface ParsedNameChange {
  oldName: string;
  newName: string;
  date: Dayjs;
}

interface PlayerNamePeriod {
  name: string;
  validFrom: Date;
  validTo: Date | null;
}

/**
 * Parse a Moscow timezone date string to UTC Date
 * Format: DD.MM.YYYY H:m or DD.MM.YYYY HH:mm
 */
const parseMoscowDate = (rawDate: string): Dayjs | null => {
  const [datePart, timePart] = rawDate.split(' ');

  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split('.');

  if (!day || !month || !year) return null;

  const [hours, minutes] = timePart.split(':');

  if (hours === undefined || minutes === undefined) return null;

  try {
    const dateStr = `${day}.${month}.${year} ${hours}:${minutes}`;
    const parsed = dayjs(dateStr, 'D.M.YYYY H:m').tz('Europe/Moscow', true).utc();

    if (!parsed.isValid()) return null;

    return parsed;
  } catch {
    return null;
  }
};

/**
 * Parse CSV content into raw records
 * CSV columns: Отметка времени, Ссылка на профиль, Старый позывной, Новый позывной, Дата смены ника, Статус, Причина отказа, ...
 */
const parseCSV = (content: string): RawCSVRecord[] => {
  const lines = content.split('\n');

  if (lines.length <= 1) return [];

  const records: RawCSVRecord[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    // Parse CSV line respecting quoted fields
    const fields = parseCSVLine(line);

    // Column indices (0-based):
    // 0: Отметка времени
    // 1: Ссылка на профиль
    // 2: Старый позывной
    // 3: Новый позывной
    // 4: Дата смены ника
    // 5: Статус
    const oldName = fields[2]?.trim() ?? '';
    const newName = fields[3]?.trim() ?? '';
    const date = fields[4]?.trim() ?? '';
    const status = (fields[5]?.trim() ?? '') as StatusRU;

    if (oldName && newName && date) {
      records.push({
        oldName,
        newName,
        date,
        status,
      });
    }
  }

  return records;
};

/**
 * Parse a single CSV line, handling quoted fields
 */
const parseCSVLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);

  return fields;
};

/**
 * Process raw records: filter accepted, parse dates, sort by date
 */
const processRecords = (records: RawCSVRecord[]): ParsedNameChange[] => {
  const parsed: ParsedNameChange[] = [];

  for (const record of records) {
    // Only process accepted changes
    if (record.status !== 'Принято') continue;

    const date = parseMoscowDate(record.date);

    if (!date) continue;

    parsed.push({
      oldName: record.oldName.trim(),
      newName: record.newName.trim(),
      date,
    });
  }

  // Sort by date ascending
  parsed.sort((a, b) => (a.date.isAfter(b.date) ? 1 : -1));

  return parsed;
};

/**
 * Group name changes by player identity
 * Returns a map of playerId -> array of name periods
 */
const groupByPlayer = (changes: ParsedNameChange[]): Map<string, PlayerNamePeriod[]> => {
  const playerIdCounter = { value: 0 };
  // Map from lowercase name to playerId
  const nameToPlayerId = new Map<string, string>();
  // Map from playerId to name periods
  const playerPeriods = new Map<string, PlayerNamePeriod[]>();

  const farFutureDate = new Date('2100-01-01T23:59:59.999Z');
  const epochStart = new Date(1000); // Unix epoch + 1 second

  for (const change of changes) {
    const oldNameLower = change.oldName.toLowerCase();
    const newNameLower = change.newName.toLowerCase();
    const changeDate = change.date.toDate();

    let playerId = nameToPlayerId.get(oldNameLower);

    if (!playerId) {
      // New player - create entry
      playerId = `temp-${playerIdCounter.value++}`;
      nameToPlayerId.set(oldNameLower, playerId);

      // Create initial period for old name
      playerPeriods.set(playerId, [
        {
          name: oldNameLower,
          validFrom: epochStart,
          validTo: changeDate,
        },
      ]);
    } else {
      // Existing player - update the last period's end date
      const periods = playerPeriods.get(playerId)!;
      const lastPeriod = periods[periods.length - 1];

      if (lastPeriod.validTo === null || lastPeriod.validTo > changeDate) {
        lastPeriod.validTo = changeDate;
      }
    }

    // Map new name to this player
    nameToPlayerId.set(newNameLower, playerId);

    // Add new name period
    const periods = playerPeriods.get(playerId)!;

    periods.push({
      name: newNameLower,
      validFrom: changeDate,
      validTo: farFutureDate,
    });
  }

  // Set the last period's validTo to null (current name, no end date)
  Array.from(playerPeriods.values()).forEach((periods) => {
    if (periods.length > 0) {
      const lastPeriod = periods[periods.length - 1];

      if (lastPeriod.validTo !== null && lastPeriod.validTo.getTime() === farFutureDate.getTime()) {
        lastPeriod.validTo = null;
      }
    }
  });

  return playerPeriods;
};

/**
 * Seed name changes from a CSV file into the database
 */
export const seedNameChangesFromCSV = async (csvPath: string): Promise<void> => {
  let content: string;

  try {
    content = await readFile(csvPath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist - nothing to seed
      return;
    }

    throw error;
  }

  if (!content.trim()) {
    // Empty file - nothing to seed
    return;
  }

  const rawRecords = parseCSV(content);

  if (rawRecords.length === 0) {
    return;
  }

  const processedChanges = processRecords(rawRecords);

  if (processedChanges.length === 0) {
    return;
  }

  const playerPeriods = groupByPlayer(processedChanges);

  if (playerPeriods.size === 0) {
    return;
  }

  const db = getDbClient();

  // Use transaction for atomicity
  await db.$transaction(async (tx) => {
    const periodsArray = Array.from(playerPeriods.values());

    for (let i = 0; i < periodsArray.length; i++) {
      const periods = periodsArray[i];

      // Create player with all name periods
      await tx.player.create({
        data: {
          names: {
            create: periods.map((period) => ({
              name: period.name,
              validFrom: period.validFrom,
              validTo: period.validTo,
            })),
          },
        },
      });
    }
  });
};

// Export helpers for testing
export {
  parseCSV,
  parseCSVLine,
  parseMoscowDate,
  processRecords,
  groupByPlayer,
};

export type {
  RawCSVRecord,
  ParsedNameChange,
  PlayerNamePeriod,
};
