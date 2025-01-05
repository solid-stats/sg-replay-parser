import path from 'path';

import fs from 'fs-extra';
import pino from 'pino';

import { dayjsUTC } from './dayjs';
import { dateFormat } from './namesHelper/utils/consts';
import { logsPath } from './paths';

const pinoPrettyDefaultOptions = { sync: true, colorize: true, colorizeObjects: true };

const getTransport = () => {
  fs.ensureDirSync(logsPath);

  const logsFolderPath = path.join(logsPath, dayjsUTC().tz('Europe/Moscow').format(dateFormat));

  const infoFilePath = path.join(logsFolderPath, 'info.log');
  const errorFilePath = path.join(logsFolderPath, 'error.log');

  if (process.env?.NODE_ENV === 'test') return undefined;

  if (fs.pathExistsSync(logsFolderPath)) fs.emptyDirSync(logsFolderPath);
  else fs.mkdirSync(logsFolderPath);

  fs.createFileSync(infoFilePath);
  fs.createFileSync(errorFilePath);

  return pino.transport<Record<string, unknown>>({
    targets: [
      { target: 'pino-pretty', level: 'info', options: { destination: infoFilePath, ...pinoPrettyDefaultOptions } },
      { target: 'pino-pretty', level: 'error', options: { destination: errorFilePath, ...pinoPrettyDefaultOptions } },
    ],
    dedupe: true,
  });
};

const logger = pino(getTransport());

process.on('uncaughtException', (err) => {
  logger.fatal('Uncaught exception detected', err);

  process.exit(1);
});

export default logger;
