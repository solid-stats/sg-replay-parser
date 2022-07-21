import fetch from 'node-fetch';

const fetchReplaysPage = async (pageNumber: number) => (
  fetch(`https://solidgames.ru/replays?p=${pageNumber}`).then((resp: Response) => resp.text())
);

export default fetchReplaysPage;
