import os from 'os';
import path from 'path';

const statsDir = path.join(os.homedir(), 'sg_stats');

export const rawReplaysDir = path.join(statsDir, 'raw_replays');

export const listsDir = path.join(statsDir, 'lists');

export const resultsDir = path.join(statsDir, 'results');

export const tempResultsDir = path.join(statsDir, 'temp_results');

export const yearResultsDir = path.join(statsDir, 'year_results');

export const logsDir = path.join(statsDir, 'logs');

export const basicDirs = [
  statsDir, rawReplaysDir, listsDir, resultsDir, yearResultsDir,
].filter(Boolean);

export const replaysListDir = path.join(listsDir, 'replaysList.json');

export const configDir = path.join(statsDir, 'config');
