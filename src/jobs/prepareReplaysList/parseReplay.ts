import fetchReplaysPage from './utils/fetchReplayPage';
import parseDOM from './utils/parseDOM';

const parseReplay = async (replayLink: string): Promise<string> => {
  const response = await fetchReplaysPage(replayLink);
  const dom = parseDOM(response);
  const filename = dom.getElementById('filename')?.getAttribute('value');
  const dataOcapName = dom.getElementsByTagName('body').item(0)?.getAttribute('data-ocap');

  const replayName = filename || dataOcapName;

  if (!replayName) throw new Error(`Failed to find replay name in ${replayLink}`);

  return replayName;
};

export default parseReplay;
