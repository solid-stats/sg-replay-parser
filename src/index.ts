import fetch from 'node-fetch';

import parseReplayInfo from './parseReplay';

const fetchReplay = async () => {
  const resp = await fetch('https://replays.solidgames.ru/data/2022_04_08__23_07_23__2_ocap.json');
  const data = await resp.json() as ReplayInfo;
  const parsedReplay = parseReplayInfo(data);

  console.log(parsedReplay);
};

fetchReplay();
