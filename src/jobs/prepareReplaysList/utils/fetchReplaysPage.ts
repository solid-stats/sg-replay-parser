import request from '../../../0 - utils/request';

const fetchReplaysPage = async (pageNumber: number): Promise<string> => {
  const response = await request(`https://sg.zone/replays?p=${pageNumber}`);

  if (!response) throw new Error(`Empty response while fetching replays page ${pageNumber}`);

  return response.text();
};

export default fetchReplaysPage;
