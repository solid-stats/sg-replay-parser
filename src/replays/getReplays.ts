import fetchData from '../fetchData';

const getReplays = async (): Promise<Replay[]> => {
  const replays = await fetchData<ReplayRaw[]>('https://replays.solidgames.ru/Replays');
  const sgReplays = replays.filter((replay) => (
    replay.mission_name.includes('sg')
    && !replay.mission_name.includes('mace')
    && !replay.mission_name.includes('sgs')
  ));

  return sgReplays.map((replay) => ({
    ...replay,
    date: new Date(replay.date),
  }));
};

export default getReplays;
