import fetchData from '../fetchData';

const getReplays = async (gameType: GameType): Promise<Replay[]> => {
  const allReplays = await fetchData<ReplayRaw[]>('https://replays.solidgames.ru/Replays');
  const replays = allReplays.filter(
    (replay) => (
      replay.mission_name.startsWith(gameType)
      && !replay.mission_name.startsWith('sgs')
    ),
  );

  return replays.map((replay) => ({
    ...replay,
    date: new Date(replay.date),
  }));
};

export default getReplays;
