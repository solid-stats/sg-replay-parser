import request from '../../0 - utils/request';

const fetchReplaysPage = async (pageNumber: number) => (
  request(`https://solidgames.ru/replays?p=${pageNumber}`).then((resp: Response) => resp.text())
);

export default fetchReplaysPage;
