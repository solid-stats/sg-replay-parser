import { cloneDeep, compact, keyBy } from 'lodash';

import mergeOtherPlayers from '../../0 - utils/mergeOtherPlayers';
import parseCSV from './parseCSV';

type PlayersInfoByName = Record<PlayerName, PlayerInfo>;

const processRequest = (
  playerInfo: PlayerInfo[],
  players: PlayersInfoByName,
  request: GameResultsChangeRequest,
): PlayersInfoByName => {
  const result = cloneDeep(players);
  const requestedPlayerFullName = playerInfo.find(
    (info) => info.name.toLowerCase().includes(request.requestedPlayer),
  )?.name;

  if (!requestedPlayerFullName) return result;

  const requestedPlayerInfo = result[requestedPlayerFullName];
  const affectedPlayersFullName = compact(request.affectedPlayers.map((affectedPlayer) => (
    playerInfo.find(
      (info) => info.name.toLowerCase().includes(affectedPlayer),
    )?.name
  )));

  switch (request.type) {
    case 'add_kill': {
      result[requestedPlayerFullName] = {
        ...requestedPlayerInfo,
        kills: requestedPlayerInfo.kills + affectedPlayersFullName.length,
        killed: mergeOtherPlayers(
          requestedPlayerInfo.killed,
          affectedPlayersFullName.map((player) => ({ name: player, count: 1 })),
        ),
      };

      return result;
    }
    default:
      return result;
  }
};

const applyRequestsToReplay = (replayLink: ReplayLink, playerInfo: PlayerInfo[]): PlayerInfo[] => {
  const requests = parseCSV();
  const requestsForCurrentReplay = requests.filter((request) => request.replayLink === replayLink);

  if (requestsForCurrentReplay.length === 0) return playerInfo;

  let result = keyBy(playerInfo, 'name');

  requests.forEach((request) => {
    result = processRequest(playerInfo, result, request);
  });

  return Object.values(result);
};

export default applyRequestsToReplay;
