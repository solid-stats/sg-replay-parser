import request from '../../../shared/utils/request';

// path example: '/replays/1657308763'
const fetchTeamPage = async () => (
  request('https://sg.zone/team').then((resp: Response) => resp.text())
);

export default fetchTeamPage;
