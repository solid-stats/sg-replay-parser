import request from '../../../0 - utils/request';

// path example: '/replays/1657308763'
const fetchReplaysPage = async (path: string): Promise<string> => {
  const response = await request(`https://sg.zone${path}`);

  if (!response) throw new Error(`Empty response while fetching replay page ${path}`);

  return response.text();
};

export default fetchReplaysPage;
