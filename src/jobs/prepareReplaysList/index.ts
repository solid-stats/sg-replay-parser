import lodash from 'lodash';

const { union } = lodash;

/* eslint-disable no-await-in-loop */

import fs from 'fs-extra';

import generateBasicFolders from '../../0 - utils/generateBasicFolders';
import logger from '../../0 - utils/logger';
import { replaysListPath } from '../../0 - utils/paths';
import { defaultEmptyOutput, excludeReplaysPath, includeReplaysPath } from './consts';
import parseReplaysOnPage from './parseReplaysOnPage';
import checks from './utils/checks';
import fetchReplaysPage from './utils/fetchReplaysPage';
import parseDOM from './utils/parseDOM';
import processProblematicReplays from './utils/problematicReplays';
import unionReplaysInfo from './utils/unionReplaysInfo';

const readReplaysListFile = (): Output => {
  try {
    return JSON.parse(fs.readFileSync(replaysListPath, 'utf8'));
  } catch (e) {
    logger.info(`${replaysListPath} file doesn't exist or has the wrong format. Trace: ${e.stack}`);

    return { ...defaultEmptyOutput };
  }
};

const readIncludeReplays = (): ConfigIncludeReplay[] => {
  try {
    return JSON.parse(fs.readFileSync(includeReplaysPath, 'utf8'));
  } catch (e) {
    logger.error(`Error occurred during reading ${includeReplaysPath} file. Trace: ${e.stack}`);

    return [];
  }
};

const readExcludeReplays = (): ConfigExcludeReplays => {
  try {
    return JSON.parse(fs.readFileSync(excludeReplaysPath, 'utf8'));
  } catch (e) {
    logger.error(`Error occurred during reading ${excludeReplaysPath} file. Trace: ${e.stack}`);

    return [];
  }
};

const bytesToMb = (bytes: number): number => (
  Math.round((bytes / (1024 * 1024)) * 10) / 10
);

const startFetchingReplays = async (maxPages: number | null) => {
  const prepareReplaysListStartedAt = new Date().toISOString();

  generateBasicFolders();
  const replaysList = readReplaysListFile();
  const includeReplays = readIncludeReplays();
  const excludeReplays = readExcludeReplays();

  logger.info(
    `
Starting fetching replays.
Found ${replaysList.parsedReplays.length} already parsed replays and ${replaysList.problematicReplays.length} problematic replays.
Start preparing new replays list.`,
  );

  let result: Output = { ...defaultEmptyOutput };
  const response: string = await fetchReplaysPage(1);
  const dom = parseDOM(response);

  const totalPages = maxPages ?? (parseInt(dom.querySelector('.pagination-item:nth-last-child(2) > a')?.textContent || '', 10) || 1);
  let newReplaysCount = 0;

  for (let page = 1; page <= totalPages; page += 1) {
    logger.debug(`Processing page ${page} of ${totalPages}`);

    const pageDom = page === 1
      ? dom
      : parseDOM(await fetchReplaysPage(page));

    const newReplays = await parseReplaysOnPage(
      pageDom,
      replaysList.parsedReplays,
      includeReplays,
    );

    result = {
      ...result,
      parsedReplays: union(result.parsedReplays, newReplays.parsedReplays),
      replays: union(result.replays, newReplays.replays),
    };
    newReplaysCount += newReplays.parsedReplays.length;
    logger.debug(`New replays: ${newReplays.parsedReplays.length}, total new replays: ${newReplaysCount}`);

    if (page % 25 === 0 || page === totalPages) {
      const memoryUsage = process.memoryUsage();

      logger.debug(
        `Memory usage on page ${page}: rss=${bytesToMb(memoryUsage.rss)}MB heapUsed=${bytesToMb(memoryUsage.heapUsed)}MB heapTotal=${bytesToMb(memoryUsage.heapTotal)}MB`,
      );
    }
  }

  logger.debug('Parsed replays list');

  result = unionReplaysInfo(replaysList, result);
  result = {
    ...result,
    replays: result.replays.filter(
      (replay) => (
        !excludeReplays.includes(replay.replayLink)
      ),
    ),
    parsedReplays: result.parsedReplays.filter(
      (replay) => (
        !excludeReplays.includes(replay)
      ),
    ),
  };
  result = processProblematicReplays(result);
  result = {
    ...result,
    replaysListPreparedAt: prepareReplaysListStartedAt,
  };

  logger.info(
    `
Fetched replays.
Found: ${newReplaysCount} new replays and ${result.problematicReplays.length} problematic replays.
Total replays: ${result.parsedReplays.length}.`,
  );

  checks(result);

  fs.writeFileSync(replaysListPath, JSON.stringify(result, null, '\t'));
};

export default startFetchingReplays;
