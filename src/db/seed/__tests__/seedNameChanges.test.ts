import { readFile } from 'fs/promises';

import { getDbClient } from '../../client';
import {
  seedNameChangesFromCSV,
  parseCSV,
  parseCSVLine,
  parseMoscowDate,
  processRecords,
  groupByPlayer,
} from '../seedNameChanges';
import type { RawCSVRecord, ParsedNameChange } from '../seedNameChanges';

// Mock the database client
jest.mock('../../client', () => ({
  getDbClient: jest.fn(),
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

const mockGetDbClient = getDbClient as jest.MockedFunction<typeof getDbClient>;
const mockReadFile = readFile as jest.MockedFunction<typeof readFile>;

describe('seedNameChanges', () => {
  describe('parseCSVLine', () => {
    it('should parse simple CSV line', () => {
      const line = 'a,b,c,d';
      const result = parseCSVLine(line);

      expect(result).toEqual(['a', 'b', 'c', 'd']);
    });

    it('should handle quoted fields', () => {
      const line = '"field1","field2","field3"';
      const result = parseCSVLine(line);

      expect(result).toEqual(['field1', 'field2', 'field3']);
    });

    it('should handle mixed quoted and unquoted fields', () => {
      const line = '"quoted",unquoted,"another quoted"';
      const result = parseCSVLine(line);

      expect(result).toEqual(['quoted', 'unquoted', 'another quoted']);
    });

    it('should handle commas inside quoted fields', () => {
      const line = '"field, with comma","normal"';
      const result = parseCSVLine(line);

      expect(result).toEqual(['field, with comma', 'normal']);
    });

    it('should handle escaped quotes', () => {
      const line = '"field ""with"" quotes","normal"';
      const result = parseCSVLine(line);

      expect(result).toEqual(['field "with" quotes', 'normal']);
    });

    it('should handle empty fields', () => {
      const line = 'a,,c,';
      const result = parseCSVLine(line);

      expect(result).toEqual(['a', '', 'c', '']);
    });
  });

  describe('parseMoscowDate', () => {
    it('should parse valid date with single digit hour/minute', () => {
      const result = parseMoscowDate('10.05.2021 0:00');

      expect(result).not.toBeNull();
      expect(result!.isValid()).toBe(true);
      // Moscow is UTC+3, so 0:00 Moscow = 21:00 previous day UTC
      expect(result!.utc().format('YYYY-MM-DD HH:mm')).toBe('2021-05-09 21:00');
    });

    it('should parse valid date with two digit hour/minute', () => {
      const result = parseMoscowDate('01.11.2021 13:30');

      expect(result).not.toBeNull();
      expect(result!.isValid()).toBe(true);
      expect(result!.utc().format('YYYY-MM-DD HH:mm')).toBe('2021-11-01 10:30');
    });

    it('should return null for invalid date format', () => {
      expect(parseMoscowDate('invalid')).toBeNull();
      expect(parseMoscowDate('10.05.2021')).toBeNull(); // missing time
      expect(parseMoscowDate('10.05.2021 ')).toBeNull(); // empty time
      expect(parseMoscowDate('')).toBeNull();
    });

    it('should return null for incomplete time', () => {
      expect(parseMoscowDate('10.05.2021 10')).toBeNull();
    });

    it('should return null when date parsing throws', () => {
      // Trigger a parsing exception with malformed input
      // This tests the catch block for date parsing errors
      expect(parseMoscowDate('invalid.date.format time:invalid')).toBeNull();
    });
  });

  describe('parseCSV', () => {
    it('should parse CSV content correctly', () => {
      const content = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус","Причина отказа","","","",""
"19.09.2023 18:07:33","https://sg.zone/profile/Mineski","Mineski","Memeski","10.05.2021 0:00","Принято","","","","",""
"12.08.2023 20:30:20","https://sg.zone/profile/Mineski","Memeski","Mineski","01.11.2021 3:00","Принято","","","","",""`;

      const result = parseCSV(content);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        oldName: 'Mineski',
        newName: 'Memeski',
        date: '10.05.2021 0:00',
        status: 'Принято',
      });
      expect(result[1]).toEqual({
        oldName: 'Memeski',
        newName: 'Mineski',
        date: '01.11.2021 3:00',
        status: 'Принято',
      });
    });

    it('should handle empty content', () => {
      const result = parseCSV('');

      expect(result).toEqual([]);
    });

    it('should handle header only', () => {
      const content = '"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"';
      const result = parseCSV(content);

      expect(result).toEqual([]);
    });

    it('should skip lines with missing required fields', () => {
      const content = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"
"timestamp","link","","NewName","10.05.2021 0:00","Принято"
"timestamp","link","OldName","","10.05.2021 0:00","Принято"
"timestamp","link","OldName","NewName","","Принято"
"timestamp","link","ValidOld","ValidNew","10.05.2021 0:00","Принято"`;

      const result = parseCSV(content);

      expect(result).toHaveLength(1);
      expect(result[0].oldName).toBe('ValidOld');
    });

    it('should trim whitespace from names', () => {
      const content = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"
"timestamp","link","  SpacedName  ","  NewName  ","10.05.2021 0:00","Принято"`;

      const result = parseCSV(content);

      expect(result).toHaveLength(1);
      expect(result[0].oldName).toBe('SpacedName');
      expect(result[0].newName).toBe('NewName');
    });
  });

  describe('processRecords', () => {
    it('should filter out declined records', () => {
      const records: RawCSVRecord[] = [
        {
          oldName: 'OldAccepted', newName: 'NewAccepted', date: '10.05.2021 0:00', status: 'Принято',
        },
        {
          oldName: 'OldDeclined', newName: 'NewDeclined', date: '11.05.2021 0:00', status: 'Отказано',
        },
      ];

      const result = processRecords(records);

      expect(result).toHaveLength(1);
      expect(result[0].oldName).toBe('OldAccepted');
    });

    it('should filter out records with invalid dates', () => {
      const records: RawCSVRecord[] = [
        {
          oldName: 'ValidDate', newName: 'New1', date: '10.05.2021 0:00', status: 'Принято',
        },
        {
          oldName: 'InvalidDate', newName: 'New2', date: 'invalid', status: 'Принято',
        },
        {
          oldName: 'MissingTime', newName: 'New3', date: '10.05.2021', status: 'Принято',
        },
      ];

      const result = processRecords(records);

      expect(result).toHaveLength(1);
      expect(result[0].oldName).toBe('ValidDate');
    });

    it('should sort records by date ascending', () => {
      const records: RawCSVRecord[] = [
        {
          oldName: 'Third', newName: 'New3', date: '10.05.2023 0:00', status: 'Принято',
        },
        {
          oldName: 'First', newName: 'New1', date: '10.05.2021 0:00', status: 'Принято',
        },
        {
          oldName: 'Second', newName: 'New2', date: '10.05.2022 0:00', status: 'Принято',
        },
      ];

      const result = processRecords(records);

      expect(result).toHaveLength(3);
      expect(result[0].oldName).toBe('First');
      expect(result[1].oldName).toBe('Second');
      expect(result[2].oldName).toBe('Third');
    });

    it('should preserve original name casing', () => {
      const records: RawCSVRecord[] = [
        {
          oldName: 'MixedCase', newName: 'AnotherCase', date: '10.05.2021 0:00', status: 'Принято',
        },
      ];

      const result = processRecords(records);

      expect(result[0].oldName).toBe('MixedCase');
      expect(result[0].newName).toBe('AnotherCase');
    });
  });

  describe('groupByPlayer', () => {
    const createChange = (oldName: string, newName: string, dateStr: string): ParsedNameChange => {
      const dayjs = require('dayjs');

      return {
        oldName,
        newName,
        date: dayjs(dateStr),
      };
    };

    it('should handle player with single name change', () => {
      const changes: ParsedNameChange[] = [
        createChange('OldName', 'NewName', '2021-05-10'),
      ];

      const result = groupByPlayer(changes);

      expect(result.size).toBe(1);

      const periods = Array.from(result.values())[0];

      expect(periods).toHaveLength(2);
      // First period: old name from epoch to change date
      expect(periods[0].name).toBe('oldname');
      expect(periods[0].validTo).not.toBeNull();
      // Second period: new name from change date, no end
      expect(periods[1].name).toBe('newname');
      expect(periods[1].validTo).toBeNull();
    });

    it('should handle player with multiple name changes', () => {
      const changes: ParsedNameChange[] = [
        createChange('Name1', 'Name2', '2021-05-10'),
        createChange('Name2', 'Name3', '2022-06-15'),
        createChange('Name3', 'Name4', '2023-07-20'),
      ];

      const result = groupByPlayer(changes);

      expect(result.size).toBe(1);

      const periods = Array.from(result.values())[0];

      expect(periods).toHaveLength(4);
      expect(periods.map((p) => p.name)).toEqual(['name1', 'name2', 'name3', 'name4']);
      // Only last period should have null validTo
      expect(periods[0].validTo).not.toBeNull();
      expect(periods[1].validTo).not.toBeNull();
      expect(periods[2].validTo).not.toBeNull();
      expect(periods[3].validTo).toBeNull();
    });

    it('should handle multiple players', () => {
      const changes: ParsedNameChange[] = [
        createChange('Player1Old', 'Player1New', '2021-05-10'),
        createChange('Player2Old', 'Player2New', '2021-06-15'),
      ];

      const result = groupByPlayer(changes);

      expect(result.size).toBe(2);
    });

    it('should store names in lowercase', () => {
      const changes: ParsedNameChange[] = [
        createChange('MixedCASE', 'AnotherMIXED', '2021-05-10'),
      ];

      const result = groupByPlayer(changes);

      const periods = Array.from(result.values())[0];

      expect(periods[0].name).toBe('mixedcase');
      expect(periods[1].name).toBe('anothermixed');
    });

    it('should handle empty changes array', () => {
      const result = groupByPlayer([]);

      expect(result.size).toBe(0);
    });

    it('should set proper date ranges for consecutive changes', () => {
      const changes: ParsedNameChange[] = [
        createChange('A', 'B', '2021-01-01T10:00:00Z'),
        createChange('B', 'C', '2022-01-01T10:00:00Z'),
      ];

      const result = groupByPlayer(changes);

      const periods = Array.from(result.values())[0];

      // A: from epoch to first change
      expect(periods[0].validTo?.toISOString()).toBe(changes[0].date.toDate().toISOString());
      // B: from first change to second change
      expect(periods[1].validFrom.toISOString()).toBe(changes[0].date.toDate().toISOString());
      expect(periods[1].validTo?.toISOString()).toBe(changes[1].date.toDate().toISOString());
      // C: from second change, no end
      expect(periods[2].validFrom.toISOString()).toBe(changes[1].date.toDate().toISOString());
      expect(periods[2].validTo).toBeNull();
    });
  });

  describe('seedNameChangesFromCSV', () => {
    let mockTransaction: jest.Mock;
    let mockPlayerCreate: jest.Mock;

    beforeEach(() => {
      mockPlayerCreate = jest.fn().mockResolvedValue({ id: 'test-player-id' });
      mockTransaction = jest.fn().mockImplementation(async (callback) => {
        await callback({
          player: {
            create: mockPlayerCreate,
          },
        });
      });

      mockGetDbClient.mockReturnValue({
        $transaction: mockTransaction,
      } as any);

      mockReadFile.mockReset();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should correctly parse CSV and create players', async () => {
      const csvContent = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус","Причина отказа"
"19.09.2023 18:07:33","https://sg.zone/profile/Mineski","Mineski","Memeski","10.05.2021 0:00","Принято",""`;

      mockReadFile.mockResolvedValue(csvContent);

      await seedNameChangesFromCSV('/path/to/file.csv');

      expect(mockTransaction).toHaveBeenCalled();
      expect(mockPlayerCreate).toHaveBeenCalledTimes(1);

      const createCall = mockPlayerCreate.mock.calls[0][0];

      expect(createCall.data.names.create).toHaveLength(2);
      expect(createCall.data.names.create[0].name).toBe('mineski');
      expect(createCall.data.names.create[1].name).toBe('memeski');
    });

    it('should create proper date ranges for name changes', async () => {
      const csvContent = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"
"ts","link","OldName","NewName","15.06.2022 12:00","Принято"`;

      mockReadFile.mockResolvedValue(csvContent);

      await seedNameChangesFromCSV('/path/to/file.csv');

      const createCall = mockPlayerCreate.mock.calls[0][0];
      const namePeriods = createCall.data.names.create;

      // First period (old name) should have validTo set
      expect(namePeriods[0].validTo).not.toBeNull();
      expect(namePeriods[0].validFrom).toBeInstanceOf(Date);

      // Second period (new name) should have validTo = null
      expect(namePeriods[1].validTo).toBeNull();
      expect(namePeriods[1].validFrom).toBeInstanceOf(Date);
    });

    it('should handle player with single name (no changes) - declined only', async () => {
      // If there are only declined records, nothing should be created
      const csvContent = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"
"ts","link","OldName","NewName","15.06.2022 12:00","Отказано"`;

      mockReadFile.mockResolvedValue(csvContent);

      await seedNameChangesFromCSV('/path/to/file.csv');

      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('should handle player with multiple name changes', async () => {
      const csvContent = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"
"ts1","link","Name1","Name2","10.05.2021 0:00","Принято"
"ts2","link","Name2","Name3","15.06.2022 12:00","Принято"
"ts3","link","Name3","Name4","20.07.2023 18:30","Принято"`;

      mockReadFile.mockResolvedValue(csvContent);

      await seedNameChangesFromCSV('/path/to/file.csv');

      expect(mockPlayerCreate).toHaveBeenCalledTimes(1);

      const createCall = mockPlayerCreate.mock.calls[0][0];
      const namePeriods = createCall.data.names.create;

      expect(namePeriods).toHaveLength(4);
      expect(namePeriods.map((p: { name: string }) => p.name)).toEqual(['name1', 'name2', 'name3', 'name4']);

      // Only last period should have null validTo
      expect(namePeriods[0].validTo).not.toBeNull();
      expect(namePeriods[1].validTo).not.toBeNull();
      expect(namePeriods[2].validTo).not.toBeNull();
      expect(namePeriods[3].validTo).toBeNull();
    });

    it('should store names in lowercase', async () => {
      const csvContent = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"
"ts","link","MixedCASE","AnotherMIXED","15.06.2022 12:00","Принято"`;

      mockReadFile.mockResolvedValue(csvContent);

      await seedNameChangesFromCSV('/path/to/file.csv');

      const createCall = mockPlayerCreate.mock.calls[0][0];
      const namePeriods = createCall.data.names.create;

      expect(namePeriods[0].name).toBe('mixedcase');
      expect(namePeriods[1].name).toBe('anothermixed');
    });

    it('should handle empty CSV gracefully', async () => {
      mockReadFile.mockResolvedValue('');

      await seedNameChangesFromCSV('/path/to/file.csv');

      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('should handle CSV with only header gracefully', async () => {
      const csvContent = '"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"';

      mockReadFile.mockResolvedValue(csvContent);

      await seedNameChangesFromCSV('/path/to/file.csv');

      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('should handle non-existent file gracefully', async () => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;

      error.code = 'ENOENT';
      mockReadFile.mockRejectedValue(error);

      await expect(seedNameChangesFromCSV('/non/existent/file.csv')).resolves.not.toThrow();
      expect(mockTransaction).not.toHaveBeenCalled();
    });

    it('should rethrow other file errors', async () => {
      const error = new Error('Permission denied') as NodeJS.ErrnoException;

      error.code = 'EACCES';
      mockReadFile.mockRejectedValue(error);

      await expect(seedNameChangesFromCSV('/path/to/file.csv')).rejects.toThrow('Permission denied');
    });

    it('should filter out declined name changes', async () => {
      const csvContent = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"
"ts1","link","Accepted","New1","10.05.2021 0:00","Принято"
"ts2","link","Declined","New2","15.06.2022 12:00","Отказано"`;

      mockReadFile.mockResolvedValue(csvContent);

      await seedNameChangesFromCSV('/path/to/file.csv');

      expect(mockPlayerCreate).toHaveBeenCalledTimes(1);

      const createCall = mockPlayerCreate.mock.calls[0][0];

      // Should only have the accepted record's names
      expect(createCall.data.names.create[0].name).toBe('accepted');
      expect(createCall.data.names.create[1].name).toBe('new1');
    });

    it('should handle multiple different players', async () => {
      const csvContent = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"
"ts1","link","Player1Old","Player1New","10.05.2021 0:00","Принято"
"ts2","link","Player2Old","Player2New","15.06.2022 12:00","Принято"`;

      mockReadFile.mockResolvedValue(csvContent);

      await seedNameChangesFromCSV('/path/to/file.csv');

      expect(mockPlayerCreate).toHaveBeenCalledTimes(2);
    });

    it('should use transaction for atomicity', async () => {
      const csvContent = `"Отметка времени","Ссылка на профиль","Старый позывной","Новый позывной","Дата смены ника","Статус"
"ts","link","OldName","NewName","15.06.2022 12:00","Принято"`;

      mockReadFile.mockResolvedValue(csvContent);

      await seedNameChangesFromCSV('/path/to/file.csv');

      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(typeof mockTransaction.mock.calls[0][0]).toBe('function');
    });
  });
});
