import fetchData from './fetchData';

// import parseReplayInfo from './parseReplay';

// const fetchReplay = async () => {
//   const resp = await fetch('https://replays.solidgames.ru/data/2022_04_08__23_07_23__2_ocap.json');
//   const data = await resp.json() as ReplayInfo;
//   const parsedReplay = parseReplayInfo(data);

//   console.log(parsedReplay);
// };

// fetchReplay();

(async () => {
  let globalStatistics: GlobalPlayerStatistics[] = [];

  const replays = await fetchData<Replay[]>('https://replays.solidgames.ru/Replays');
  const sgReplays = replays.filter((replay) => replay.mission_name.includes('sg'));

  sgReplays.forEach((replay) => {
    
  })

  // console.log(sgReplays);
  console.log(globalStatistics);
})();
