import path from 'path';

import fs from 'fs-extra';

import { parsingStatusPath, replaysListPath } from './paths';

const isObject = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

export const readRunReplayListPreparedAt = (): string | null => {
  try {
    const parsed = JSON.parse(fs.readFileSync(replaysListPath, 'utf8')) as unknown;

    if (!isObject(parsed) || typeof parsed.replaysListPreparedAt !== 'string') {
      return null;
    }

    return parsed.replaysListPreparedAt;
  } catch {
    return null;
  }
};

export const commitParsingStatus = (updateTime: string | null): void => {
  const tempPath = `${parsingStatusPath}.tmp-${process.pid}-${Date.now()}`;
  const payload = JSON.stringify({ updateTime });

  fs.ensureDirSync(path.dirname(parsingStatusPath));
  fs.writeFileSync(tempPath, payload);
  fs.moveSync(tempPath, parsingStatusPath, { overwrite: true });
};
