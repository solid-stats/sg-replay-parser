import uniqBy from 'lodash/uniqBy';

import fetchData from '../0 - utils/fetchData';

const getReplays = async (
  gameType: GameType,
  alreadyParsedReplays: AlreadyParsedReplays,
): Promise<Replay[]> => {
  const allReplays = await fetchData<ReplayRaw[]>('https://replays.solidgames.ru/Replays');
  const uniqueReplays = uniqBy(allReplays, 'filename');
  const replays = uniqueReplays.filter(
    (replay) => (
      replay.mission_name.startsWith(gameType)
      && !alreadyParsedReplays.includes(replay.id)
      && !replay.mission_name.startsWith('sgs')
    ),
  );

  return replays.map((replay) => ({
    ...replay,
    date: new Date(replay.date),
  }));
};

export default getReplays;
