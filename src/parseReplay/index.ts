import pickBy from 'lodash/pickBy';

import getKillsAndDeaths from './getKillsAndDeaths';
import getPlayersInfo from './getPlayers';

const playersPrefix = 'fnx';

const parseReplayInfo = (replay: ReplayInfo): PlayersList => {
  const players = getPlayersInfo(replay);
  const playersWithKillsInfo = getKillsAndDeaths(players, replay.events);

  return pickBy(playersWithKillsInfo, (player) => (
    player.name.toLowerCase().includes(playersPrefix.toLowerCase())
  ));
  // return playersWithKillsInfo;
};

export default parseReplayInfo;
