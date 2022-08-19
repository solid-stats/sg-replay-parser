import combineSamePlayersInfo from './combineSamePlayersInfo';
import getEntities from './getEntities';
import getKillsAndDeaths from './getKillsAndDeaths';

const parseReplayInfo = (replay: ReplayInfo): PlayersList => {
  const entities = getEntities(replay);
  const playersWithKillsInfo = getKillsAndDeaths(entities, replay.events);
  const combinedPlayers = combineSamePlayersInfo(playersWithKillsInfo);

  // used only for debug
  // fs.writeFileSync('debug.json', JSON.stringify({
  //   events: replay.events,
  //   entities,
  //   playersWithKillsInfo,
  //   combinedPlayers,
  // }, null, '\t'));

  return combinedPlayers;
};

export default parseReplayInfo;
