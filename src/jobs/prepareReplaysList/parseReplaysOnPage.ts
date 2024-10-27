import { compact } from 'lodash';
import pLimit from 'p-limit';

import { dayjsUnix } from '../../0 - utils/dayjs';
import logger from '../../0 - utils/logger';
import parseReplay from './parseReplay';
import saveReplayFile from './saveReplayFile';

const parseTableRowInfo = async (
  el: Element,
  alreadyParsedReplays: Output['parsedReplays'],
  includeReplays: ConfigIncludeReplay[],
): Promise<Replay | null> => {
  try {
    const tableCells = el.getElementsByTagName('td');
    const linkElement = el.querySelector('a');
    const replayLink = linkElement?.getAttribute('href');

    if (!(linkElement && linkElement.textContent) || !replayLink) return null;

    if (alreadyParsedReplays.includes(replayLink)) return null;

    const missionInfo = linkElement.textContent.split('@');
    let missionGameType = missionInfo[0];
    const missionName = missionInfo[1];
    const replayToInclude = includeReplays.find(({ name }) => (name === missionName));

    if (replayToInclude && !missionGameType) missionGameType = `${replayToInclude.gameType}@`;

    if (!missionGameType) return null;

    const filename = await parseReplay(replayLink);
    const date = dayjsUnix(parseInt(replayLink.split('/')[2], 10)).toJSON();

    const isFileSaved = await saveReplayFile(filename);

    if (!isFileSaved) return null;

    return {
      mission_name: `${missionGameType}@${missionName}`,
      filename,
      date,
      serverId: parseInt(tableCells[2].textContent || '', 10) || 0,
      world_name: tableCells[1].textContent || 'unknown',
      replayLink,
    };
  } catch (err) {
    const error = err as Error;

    logger.error(`Error occurred during parsing replay info. Error: ${error.message}, stack: ${error.stack}`);

    return null;
  }
};

const parseReplaysOnPage = async (
  dom: Document,
  alreadyParsedReplays: Output['parsedReplays'],
  includeReplays: ConfigIncludeReplay[],
): Promise<Output> => {
  const replaysList = Array.from(dom.querySelectorAll('.common-table > tbody > tr'));

  const limit = pLimit(10);
  const rawReplays = await Promise.all(
    replaysList.map((replay) => limit(() => parseTableRowInfo(
      replay,
      alreadyParsedReplays,
      includeReplays,
    ))),
  );
  const replays = compact(rawReplays);
  const parsedReplays = replays.map((val) => val.replayLink);

  return {
    parsedReplays,
    replays,
    problematicReplays: [],
  };
};

export default parseReplaysOnPage;
