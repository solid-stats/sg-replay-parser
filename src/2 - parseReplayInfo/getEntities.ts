import isUndefined from 'lodash/isUndefined';

const defaultPlayerInfo: PlayerInfo = {
  id: -1,
  name: '',
  side: 'CIV',
  kills: 0,
  vehicleKills: 0,
  teamkills: 0,
  isDead: false,
  isDeadByTeamkill: false,
  weapons: [],
};

const getEntities = ({ entities, events }: ReplayInfo): VehiclesWithPlayersList => {
  const players: PlayersList = {};
  const vehicles: VehicleList = {};

  entities.forEach(({
    name, side, id, class: vehicleClass, type, isPlayer,
  }) => {
    if (type === 'unit' && isPlayer) {
      players[id] = {
        ...defaultPlayerInfo,
        id,
        name,
        side,
      };

      return;
    }

    if (type === 'vehicle') {
      vehicles[id] = {
        id,
        name,
        vehicleClass,
      };
    }
  });

  events.forEach((event) => {
    const eventType = event[1];

    if (eventType === 'connected') {
      const [, , name, id] = event;

      if (isUndefined(id)) return;

      const entityInfo = entities.find((entity) => entity.id === id);

      if (isUndefined(entityInfo)) return;

      players[id] = {
        ...defaultPlayerInfo,
        id,
        name,
        side: entityInfo.side,
      };
    }
  });

  return {
    players,
    vehicles,
  };
};

export default getEntities;
