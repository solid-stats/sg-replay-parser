import getEntities from './getEntities';
import getKillsAndDeaths from './getKillsAndDeaths';

const parseReplayInfo = (replay: ReplayInfo): PlayersList => {
  const entities = getEntities(replay);
  const playersWithKillsInfo = getKillsAndDeaths(entities, replay.events);

  return playersWithKillsInfo;
};

export default parseReplayInfo;
