import path from 'path';

import fs from 'fs-extra';
import pino from 'pino';

import { dayjsUTC } from './dayjs';
import { dateFormat } from './namesHelper/utils/consts';
import { logsPath } from './paths';

const pinoPrettyDefaultOptions = { sync: true, colorize: true, colorizeObjects: true };
const loggerLevel = process.env.LOG_LEVEL || 'debug';

const getTransport = () => {
  fs.ensureDirSync(logsPath);

  const logsFolderPath = path.join(logsPath, dayjsUTC().tz('Europe/Moscow').format(dateFormat));

  const debugFilePath = path.join(logsFolderPath, 'debug.log');
  const infoFilePath = path.join(logsFolderPath, 'info.log');
  const warningFilePath = path.join(logsFolderPath, 'warning.log');
  const errorFilePath = path.join(logsFolderPath, 'error.log');

  if (process.env?.NODE_ENV === 'test') return undefined;

  fs.ensureFileSync(debugFilePath);
  fs.ensureFileSync(infoFilePath);
  fs.ensureFileSync(warningFilePath);
  fs.ensureFileSync(errorFilePath);

  const consoleStream = pino.transport({
    target: 'pino-pretty',
    options: pinoPrettyDefaultOptions,
  });

  const filesStream = pino.transport<Record<string, unknown>>({
    targets: [
      { target: 'pino-pretty', level: 'debug', options: { destination: debugFilePath, ...pinoPrettyDefaultOptions } },
      { target: 'pino-pretty', level: 'info', options: { destination: infoFilePath, ...pinoPrettyDefaultOptions } },
      { target: 'pino-pretty', level: 'warn', options: { destination: warningFilePath, ...pinoPrettyDefaultOptions } },
      { target: 'pino-pretty', level: 'error', options: { destination: errorFilePath, ...pinoPrettyDefaultOptions } },
    ],
    dedupe: true,
  });

  return pino.multistream([
    { stream: consoleStream, level: loggerLevel as pino.Level },
    { stream: filesStream, level: 'debug' },
  ]);
};

const transport = getTransport();
const logger = transport
  ? pino({ level: loggerLevel }, transport)
  : pino({ level: loggerLevel });

const getErrorDetails = (error: unknown): { message: string; stack: string | undefined } => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
    stack: undefined,
  };
};

process.on('uncaughtException', (error, origin) => {
  const errorDetails = getErrorDetails(error);

  logger.fatal(
    `Uncaught exception detected. Origin: ${origin}. Error: ${errorDetails.message}. Stack: ${errorDetails.stack || 'n/a'}`,
  );

  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  const errorDetails = getErrorDetails(reason);

  logger.fatal(
    `Unhandled promise rejection detected. Error: ${errorDetails.message}. Stack: ${errorDetails.stack || 'n/a'}`,
  );

  process.exit(1);
});

const logTerminationSignal = (signal: NodeJS.Signals): void => {
  logger.fatal(`Process received ${signal}. Exiting.`);
  process.exit(1);
};

process.on('SIGINT', () => {
  logTerminationSignal('SIGINT');
});

process.on('SIGTERM', () => {
  logTerminationSignal('SIGTERM');
});

export default logger;
