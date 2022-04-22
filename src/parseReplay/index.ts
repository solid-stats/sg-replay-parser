import getKillsAndDeaths from './getKillsAndDeaths';
import getPlayersInfo from './getPlayers';

const parseReplayInfo = (replay: ReplayInfo): PlayersList => {
  const players = getPlayersInfo(replay);
  const playersWithKillsInfo = getKillsAndDeaths(players, replay.events);

  return playersWithKillsInfo;
};

export default parseReplayInfo;
