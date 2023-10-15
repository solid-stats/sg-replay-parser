import path from 'path';

import fs from 'fs-extra';
import pino from 'pino';

import { dayjsUTC } from './dayjs';
import { logsDir } from './dirs';
import { dateFormat } from './namesHelper/utils/consts';

const pinoPrettyDefaultOptions = { colorize: true, colorizeObjects: true };

const getTransport = () => {
  fs.ensureDirSync(logsDir);

  const logsFolderPath = path.join(logsDir, dayjsUTC().tz('Europe/Moscow').format(dateFormat));

  const infoFilePath = path.join(logsFolderPath, 'info.log');
  const errorFilePath = path.join(logsFolderPath, 'error.log');

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

export default logger;
