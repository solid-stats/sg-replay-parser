/* eslint-disable no-await-in-loop */

import fs from 'fs';

import cliProgress from 'cli-progress';
import { union } from 'lodash';

import { replaysListFileName } from '../0 - consts';
import { defaultEmptyOutput, excludeReplaysPath, includeReplaysPath } from './consts';
import parseReplaysOnPage from './parseReplaysOnPage';
import checks from './utils/checks';
import fetchReplaysPage from './utils/fetchReplaysPage';
import parseDOM from './utils/parseDOM';
import processProblematicReplays from './utils/problematicReplays';
import unionReplaysInfo from './utils/unionReplaysInfo';

const readReplaysListFile = (): Output => {
  try {
    return JSON.parse(fs.readFileSync(replaysListFileName, 'utf8'));
  } catch {
    return { ...defaultEmptyOutput };
  }
};

const readIncludeReplays = (): ConfigIncludeReplays => {
  try {
    return JSON.parse(fs.readFileSync(includeReplaysPath, 'utf8'));
  } catch {
    // eslint-disable-next-line no-console
    console.log(`${includeReplaysPath} file doesn't exist or has the wrong format`);

    return [];
  }
};
const readExcludeReplays = (): ConfigExcludeReplays => {
  try {
    return JSON.parse(fs.readFileSync(excludeReplaysPath, 'utf8'));
  } catch {
    // eslint-disable-next-line no-console
    console.log(`${excludeReplaysPath} file doesn't exist or has the wrong format`);

    return [];
  }
};

(async () => {
  const replaysList = readReplaysListFile();
  const includeReplays = readIncludeReplays();
  const excludeReplays = readExcludeReplays();

  // eslint-disable-next-line no-console
  console.log(`Found ${replaysList.parsedReplays.length} already parsed replays and ${replaysList.problematicReplays.length} problematic replays. Start preparing new replays list`);
  // eslint-disable-next-line no-console
  console.log('');

  let result: Output = { ...defaultEmptyOutput };
  const bar = new cliProgress.SingleBar({
    format: 'Pages parsed | {bar} {percentage}% | ETA: {eta}s | {value}/{total} pages',
    gracefulExit: true,
  });
  const response: string = await fetchReplaysPage(1);
  const dom = parseDOM(response);

  const totalPages = parseInt(dom.querySelector('.pagination-item:nth-last-child(2) > a')?.textContent || '', 10) || 1;

  bar.start(totalPages, 1);

  for (let page = 1; page <= totalPages; page += 1) {
    const pageDom = page === 1
      ? dom
      : parseDOM(await fetchReplaysPage(page));

    const newReplays = await parseReplaysOnPage(
      pageDom,
      replaysList.parsedReplays,
      includeReplays,
      excludeReplays,
    );

    result = {
      ...result,
      parsedReplays: union(result.parsedReplays, newReplays.parsedReplays),
      replays: union(result.replays, newReplays.replays),
    };

    if (page < totalPages) bar.increment();
  }

  bar.stop();

  result = processProblematicReplays(result);

  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log(`Found: ${result.parsedReplays.length} new replays and ${result.problematicReplays.length} problematic replays.`);
  // eslint-disable-next-line no-console
  console.log('');

  result = unionReplaysInfo(replaysList, result);

  checks(result);

  // eslint-disable-next-line no-console
  console.log(`Total replays: ${result.parsedReplays.length}.`);

  fs.writeFileSync(replaysListFileName, JSON.stringify(result, null, '\t'));
})();
