import fetchData from '../fetchData';
import getGameTypeFromMissionName from '../utils/getGameTypeFromMissionName';

const getReplays = async (gameType: GameType): Promise<Replay[]> => {
  const allReplays = await fetchData<ReplayRaw[]>('https://replays.solidgames.ru/Replays');
  const replays = allReplays.filter(
    (replay) => gameType === getGameTypeFromMissionName(replay.mission_name),
  );

  return replays.map((replay) => ({
    ...replay,
    date: new Date(replay.date),
  }));
};

export default getReplays;
