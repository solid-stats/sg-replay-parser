import { compact } from 'lodash';
import pLimit from 'p-limit';

import { dayjsUnix } from '../0 - utils/dayjs';
import parseReplay from './parseReplay';

// mission game type protected by CloudFlare email obfuscation because contains '@' sign
// this is bug and should be fixed
// untill there is no fix, we use this decode function
// got this from here: https://usamaejaz.com/cloudflare-email-decoding/
const decodeMissionGameType = (encodedMissionGameType: string) => {
  let result = '';
  const r = parseInt(encodedMissionGameType.substr(0, 2), 16);

  for (let i = 2; encodedMissionGameType.length - i; i += 2) {
    // eslint-disable-next-line no-bitwise
    const charCode = parseInt(encodedMissionGameType.substr(i, 2), 16) ^ r;

    result += String.fromCharCode(charCode);
  }

  return result;
};

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

  // regexp removes [email protected] from string
  const missionName = linkElement.textContent.replace(/\[[^\]]*\]*/g, '');
  const encodedMissionsGameType = linkElement.querySelector('span')?.getAttribute('data-cfemail');
  let missionGameType: string | null = null;

  const replayToInclude = includeReplays.find(({ name }) => (name === missionName));

  if (encodedMissionsGameType) missionGameType = decodeMissionGameType(encodedMissionsGameType);

  if (replayToInclude && !encodedMissionsGameType) missionGameType = `${replayToInclude.gameType}@`;

  if (missionGameType === null) return null;

  const filename = await parseReplay(replayLink);
  const date = dayjsUnix(parseInt(replayLink.split('/')[2], 10)).toJSON();

  return {
    mission_name: missionGameType + missionName,
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
