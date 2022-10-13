import { isUndefined } from 'lodash';

const defaultPlayerInfo: PlayerInfo = {
  id: -1,
  name: '',
  side: 'CIV',
  kills: 0,
  killsFromVehicle: 0,
  vehicleKills: 0,
  teamkills: 0,
  isDead: false,
  isDeadByTeamkill: false,
  weapons: [],
  vehicles: [],
  killed: [],
  killers: [],
  teamkilled: [],
  teamkillers: [],
};

const getEntities = ({ entities, events }: ReplayInfo): VehiclesWithPlayersList => {
  const players: PlayersList = {};
  const vehicles: VehicleList = {};

  entities.forEach((entity) => {
    if (entity.type === 'unit' && entity.isPlayer && entity.description.length && entity.name) {
      const { id, name, side } = entity;

      players[id] = {
        ...defaultPlayerInfo,
        id,
        name,
        side,
      };

      return;
    }

    if (entity.type === 'vehicle') {
      const { id, name, vehicleClass } = entity;

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

      const entityInfo = entities.find((entity) => entity.id === id);

      if (isUndefined(entityInfo) || entityInfo.type === 'vehicle' || !name) return;

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
