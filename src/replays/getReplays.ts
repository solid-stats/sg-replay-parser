import fetchData from '../fetchData';

const getReplays = async () => {
  const replays = await fetchData<Replay[]>('https://replays.solidgames.ru/Replays');
  const sgReplays = replays.filter((replay) => (
    replay.mission_name.includes('sg')
    && !replay.mission_name.includes('mace')
    && !replay.mission_name.includes('sgs')
  ));

  return sgReplays;
};

export default getReplays;
