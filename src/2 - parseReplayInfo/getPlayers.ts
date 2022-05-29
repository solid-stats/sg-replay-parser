import isUndefined from 'lodash/isUndefined';

const defaultPlayerInfo = {
  kills: 0,
  teamkills: 0,
  isDead: false,
  isDeadByTeamkill: false,
};

const getPlayersInfo = ({ entities, events }: ReplayInfo): PlayersList => {
  const connectedPlayers: PlayersList = {};

  entities.forEach(({
    isPlayer, name, side, id,
  }) => {
    if (!isPlayer) return;

    connectedPlayers[id] = {
      id,
      name,
      side,
      ...defaultPlayerInfo,
    };
  });

  events.forEach((event) => {
    const eventType = event[1];

    if (eventType === 'connected') {
      const [, , name, id] = event;

      if (isUndefined(id)) return;

      const entityInfo = entities.find((entity) => entity.id === id);

      if (isUndefined(entityInfo)) return;

      connectedPlayers[id] = {
        id,
        name,
        side: entityInfo.side,
        ...defaultPlayerInfo,
      };
    }
  });

  return connectedPlayers;
};

export default getPlayersInfo;
