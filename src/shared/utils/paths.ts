import os from 'os';
import path from 'path';

import isDev from './isDev';

const statsPath = path.join(os.homedir(), isDev ? 'dev_sg_stats' : 'sg_stats');

export const rawReplaysPath = path.join(statsPath, 'raw_replays');

export const listsPath = path.join(statsPath, 'lists');

export const resultsPath = path.join(statsPath, 'results');

export const tempResultsPath = path.join(statsPath, 'temp_results');

export const yearResultsPath = path.join(statsPath, 'year_results');

export const logsPath = path.join(statsPath, 'logs');

export const basicPaths = [
  statsPath, rawReplaysPath, listsPath, resultsPath, yearResultsPath,
].filter(Boolean);

export const replaysListPath = path.join(listsPath, 'replaysList.json');

export const configPath = path.join(statsPath, 'config');
