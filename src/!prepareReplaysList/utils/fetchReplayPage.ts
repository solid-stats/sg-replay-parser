import fetch from 'node-fetch';

// path example: '/replays/1657308763'
const fetchReplaysPage = async (path: string) => (
  fetch(`https://solidgames.ru${path}`).then((resp: Response) => resp.text())
);

export default fetchReplaysPage;
