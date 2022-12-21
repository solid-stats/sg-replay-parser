import { keyBy } from 'lodash';

import { getPlayerName } from '../0 - utils/getPlayerName';
import mergeOtherPlayers from '../0 - utils/mergeOtherPlayers';
import { addWeaponStatistic, filterWeaponStatistics } from '../0 - utils/weaponsStatistic';

type CommonParams = {
  killer: PlayerInfo;
  players: PlayersList;
};

type PlayerKilledParams = CommonParams & {
  killed: PlayerInfo;
  weapon: Weapon;
  distance: Distance;
  entities: VehicleList;
};
type VehicleKilledParams = CommonParams & {
  vehicle: VehicleInfo;
};

const calculateWeaponStatistics = (
  weapon: Weapon,
  distance: Distance,
  killerWeapons: WeaponStatistic[],
): WeaponStatistic[] => {
  const weaponsStatistics = addWeaponStatistic(killerWeapons, weapon, distance);
  const weapons = filterWeaponStatistics(weaponsStatistics);

  return weapons;
};

const processPlayerKilled = ({
  killer,
  killed: killedPlayer,
  players,
  distance,
  weapon,
  entities,
}: PlayerKilledParams): PlayersList => {
  const newPlayers = { ...players };
  const isSameSide = killer.side === killedPlayer.side;
  const isSuicide = killer.id === killedPlayer.id;

  const vehiclesList = Object.values(entities);
  const vehiclesByName = keyBy(vehiclesList, 'name');

  const isKillFromVehicle = vehiclesByName[weapon] !== undefined;

  let {
    kills, teamkills, killsFromVehicle, weapons, vehicles, killed, teamkilled,
  } = killer;
  let {
    killers, teamkillers,
  } = killedPlayer;

  const killerName = getPlayerName(killer.name);
  const killedName = getPlayerName(killedPlayer.name);

  if (!(isSameSide || isSuicide)) {
    if (isKillFromVehicle) {
      vehicles = calculateWeaponStatistics(weapon, distance, killer.vehicles);
      killsFromVehicle += 1;
    } else weapons = calculateWeaponStatistics(weapon, distance, killer.weapons);

    kills += 1;

    killed = mergeOtherPlayers(killed, [{ name: killedName, count: 1 }]);
    killers = mergeOtherPlayers(killers, [{ name: killerName, count: 1 }]);
  }

  if (isSameSide && !isSuicide) {
    teamkills += 1;

    teamkilled = mergeOtherPlayers(teamkilled, [{ name: killedName, count: 1 }]);
    teamkillers = mergeOtherPlayers(killers, [{ name: killerName, count: 1 }]);
  }

  newPlayers[killedPlayer.id] = {
    ...newPlayers[killedPlayer.id],
    isDead: true,
    isDeadByTeamkill: isSuicide ? false : isSameSide,
    killers,
    teamkillers,
  };
  newPlayers[killer.id] = {
    ...newPlayers[killer.id],
    kills,
    killsFromVehicle,
    teamkills,
    weapons,
    vehicles,
    killed,
    teamkilled,
  };

  return newPlayers;
};

const processVehicleKilled = ({
  killer,
  players,
}: VehicleKilledParams): PlayersList => {
  const newPlayers = { ...players };

  newPlayers[killer.id] = {
    ...newPlayers[killer.id],
    vehicleKills: killer.vehicleKills + 1,
  };

  return newPlayers;
};

const getKillsAndDeaths = (entities: VehiclesWithPlayersList, events: ReplayInfo['events']): PlayersList => {
  let players = { ...entities.players };
  const { vehicles } = entities;

  events.forEach((event) => {
    const eventType = event[1];

    if (eventType === 'killed') {
      const [
        , ,
        killedId,
        [killerId, weapon],
        distance,
      ] = event;

      const killer = players[killerId];
      const killedPlayer = players[killedId];
      const killedVehicle = vehicles[killedId];

      if (killer && killedPlayer) {
        players = processPlayerKilled({
          killer, killed: killedPlayer, players, distance, weapon, entities: vehicles,
        });

        return;
      }

      if (killer && killedVehicle) {
        players = processVehicleKilled({ killer, vehicle: killedVehicle, players });
      }
    }
  });

  return players;
};

export default getKillsAndDeaths;
