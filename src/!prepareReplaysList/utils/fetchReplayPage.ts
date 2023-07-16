import request from '../../0 - utils/request';

// path example: '/replays/1657308763'
const fetchReplaysPage = async (path: string) => (
  request(`https://solidgames.ru${path}`).then((resp: Response) => resp.text())
);

export default fetchReplaysPage;
