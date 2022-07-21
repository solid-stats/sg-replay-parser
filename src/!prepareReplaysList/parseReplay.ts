import fetchReplaysPage from './utils/fetchReplayPage';
import parseDOM from './utils/parseDOM';

const parseReplay = async (replayLink: string): Promise<string> => {
  const response = await fetchReplaysPage(replayLink);
  const dom = parseDOM(response);
  const filename = dom.getElementById('filename')?.getAttribute('value') || '';

  return filename;
};

export default parseReplay;
