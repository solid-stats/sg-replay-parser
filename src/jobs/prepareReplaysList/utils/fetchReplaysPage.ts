import request from '../../../shared/utils/request';

const fetchReplaysPage = async (pageNumber: number) => (
  request(`https://sg.zone/replays?p=${pageNumber}`).then((resp: Response) => resp.text())
);

export default fetchReplaysPage;
