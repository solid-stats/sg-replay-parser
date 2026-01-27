import { compact, snakeCase } from 'lodash';
import pLimit from 'p-limit';

import { dayjsUnix } from '../../shared/utils/dayjs';
import logger from '../../shared/utils/logger';
import parseReplay from './parseReplay';
import saveReplayFile from './saveReplayFile';

export const getMissionName = (
  linkText: string,
  includeReplays: ConfigIncludeReplay[],
): string | undefined => {
  const gameTypeSplitSymbol = '@';

  if (!linkText.includes(gameTypeSplitSymbol)) {
    const replayToInclude = includeReplays.find(
      ({ name }) => name.toLowerCase() === linkText.toLowerCase(),
    );

    if (replayToInclude) {
      return [
        replayToInclude.gameType,
        snakeCase(linkText),
      ].join(gameTypeSplitSymbol);
    }

    return undefined;
  }

  return linkText;
};

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

    const missionName = getMissionName(
      linkElement.textContent || '',
      includeReplays,
    );

    if (!missionName) return null;

    const filename = await parseReplay(replayLink);
    const date = dayjsUnix(parseInt(replayLink.split('/')[2], 10)).toJSON();

    const isFileSaved = await saveReplayFile(filename);

    if (!isFileSaved) return null;

    return {
      mission_name: missionName,
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
