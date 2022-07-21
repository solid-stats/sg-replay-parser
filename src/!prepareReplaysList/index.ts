/* eslint-disable no-await-in-loop */

import fs from 'fs';

import cliProgress from 'cli-progress';

import { replaysListFileName } from '../0 - consts';
import parseReplaysOnPage from './parseReplaysOnPage';
import fetchReplaysPage from './utils/fetchReplaysPage';
import parseDOM from './utils/parseDOM';

(async () => {
  let result: ReplayRaw[] = [];
  const bar = new cliProgress.SingleBar({
    format: 'Pages parsed | {bar} {percentage}% | ETA: {eta}s | {value}/{total} pages',
  });
  const response: string = await fetchReplaysPage(1);
  const dom = parseDOM(response);

  const totalPages = parseInt(dom.querySelector('.pagination-item:nth-last-child(2) > a')?.textContent || '', 10) || 1;

  bar.start(totalPages, 1);

  for (let page = 1; page <= totalPages; page += 1) {
    const pageDom = page === 1
      ? dom
      : parseDOM(await fetchReplaysPage(page));

    const newReplays = await parseReplaysOnPage(pageDom);

    result = [...result, ...newReplays];

    if (page <= totalPages) bar.increment();
  }

  bar.stop();

  fs.writeFileSync(replaysListFileName, JSON.stringify(result, null, '\t'));
})();
