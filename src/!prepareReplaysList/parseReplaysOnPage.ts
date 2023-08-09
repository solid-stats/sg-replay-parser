import { compact } from 'lodash';
import pLimit from 'p-limit';

import { dayjsUnix } from '../0 - utils/dayjs';
import parseReplay from './parseReplay';

const parseTableRowInfo = async (
  el: Element,
  alreadyParsedReplays: Output['parsedReplays'],
  includeReplays: ConfigIncludeReplay[],
  excludeReplays: ConfigExcludeReplays,
): Promise<Replay | null> => {
  const tableCells = el.getElementsByTagName('td');
  const linkElement = el.querySelector('a');
  const replayLink = linkElement?.getAttribute('href');

  if (!(linkElement && linkElement.textContent) || !replayLink) return null;

  if (alreadyParsedReplays.includes(replayLink) || excludeReplays.includes(replayLink)) return null;

  const missionInfo = linkElement.textContent.split('@');
  let missionGameType = missionInfo[0];
  const missionName = missionInfo[1];
  const replayToInclude = includeReplays.find(({ name }) => (name === missionName));

  if (replayToInclude && !missionGameType) missionGameType = `${replayToInclude.gameType}@`;

  if (!missionGameType) return null;

  const filename = await parseReplay(replayLink);
  const date = dayjsUnix(parseInt(replayLink.split('/')[2], 10)).toJSON();

  return {
    mission_name: `${missionGameType}@${missionName}`,
    filename,
    date,
    serverId: parseInt(tableCells[2].textContent || '', 10) || 0,
    world_name: tableCells[1].textContent || 'unknown',
    replayLink,
  };
};

const parseReplaysOnPage = async (
  dom: Document,
  alreadyParsedReplays: Output['parsedReplays'],
  includeReplays: ConfigIncludeReplay[],
  excludeReplays: ConfigExcludeReplays,
): Promise<Output> => {
  const replaysList = Array.from(dom.querySelectorAll('.common-table > tbody > tr'));

  const limit = pLimit(15);
  const rawReplays = await Promise.all(
    replaysList.map((replay) => limit(() => parseTableRowInfo(
      replay,
      alreadyParsedReplays,
      includeReplays,
      excludeReplays,
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
