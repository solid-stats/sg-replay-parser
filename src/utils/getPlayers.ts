const defaultPlayerInfo = {
  kills: 0,
  teamkills: 0,
  isDead: false,
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

      const entityInfo = entities.find((entity) => entity.id === id);

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
