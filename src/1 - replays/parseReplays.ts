import { compact, orderBy } from 'lodash';
import pLimit from 'p-limit';

import promiseAllWithProgress from '../0 - utils/promiseAllWithProgress';
import request from '../0 - utils/request';
import parseReplayInfo from '../2 - parseReplayInfo';

export const fetchReplayInfo = async (filename: Replay['filename']): Promise<ReplayInfo | null> => {
  const resp = await request(`https://sg.zone/data/${filename}.json`);

  if (!resp) return null;

  try {
    const data = await resp.json() as ReplayInfo;

    return data;
  } catch (err) {
    let reason: string | null = null;

    if (err.message.includes('unexpected character')) reason = 'JSON includes unexpected character';

    if (err.message.includes('invalid json response')) reason = 'JSON have invalid format';

    // eslint-disable-next-line no-console
    console.log('');
    // eslint-disable-next-line no-console
    console.error(reason ?? err.message);

    return null;
  }
};

const processReplay = async (
  replay: Replay,
  gameType: GameType,
): Promise<PlayersGameResult | null> => {
  const replayInfo = await fetchReplayInfo(replay.filename);

  if (!replayInfo) return null;

  try {
    const parsedReplayInfo = parseReplayInfo(replayInfo, replay.date);
    const result = Object.values(parsedReplayInfo);

    if (gameType === 'mace' && result.length < 10) return null;

    return {
      result,
      date: replay.date,
      missionName: replay.mission_name,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err.message);

    return null;
  }
};

const parseReplays = async (
  replays: Replay[],
  gameType: GameType,
): Promise<PlayersGameResult[]> => {
  const limit = pLimit(gameType === 'mace' ? 30 : 10);
  const parsedReplays = await promiseAllWithProgress(
    replays.map((replay) => limit(() => processReplay(replay, gameType))),
    gameType,
  );

  const orderedParsedReplaysByDate = orderBy(compact(parsedReplays), 'date', 'asc');

  return orderedParsedReplaysByDate;
};

export default parseReplays;
