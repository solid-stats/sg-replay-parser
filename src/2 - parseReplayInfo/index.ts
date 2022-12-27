import combineSamePlayersInfo from './combineSamePlayersInfo';
import getEntities from './getEntities';
import getKillsAndDeaths from './getKillsAndDeaths';
import applyRequestsToReplay from './requests/applyRequests';

const parseReplayInfo = (replay: ReplayInfo): PlayerInfo[] => {
  const entities = getEntities(replay);
  const playersWithKillsInfo = getKillsAndDeaths(entities, replay.events);

  const playerInfo = Object.values(playersWithKillsInfo);
  const combinedPlayers = combineSamePlayersInfo(playerInfo);
  const playersWithAppliedRequests = applyRequestsToReplay(replay.pathname, combinedPlayers);

  // used only for debug
  // fs.writeFileSync('debug.json', JSON.stringify({
  //   events: replay.events,
  //   entities,
  //   playersWithKillsInfo,
  //   combinedPlayers,
  // }, null, '\t'));

  return playersWithAppliedRequests;
};

export default parseReplayInfo;
