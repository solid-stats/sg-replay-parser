import { Dayjs } from 'dayjs';
import { keyBy } from 'lodash';

import getPlayerName from '../../shared/utils/getPlayerName';
import mergeOtherPlayers from '../../shared/utils/mergeOtherPlayers';
import { getPlayerId } from '../../shared/utils/namesHelper/getId';
import { addWeaponStatistic, filterWeaponStatistics } from '../../shared/utils/weaponsStatistic';

type CommonParams = {
  players: PlayersList;
};

type PlayerKilledParams = CommonParams & {
  killer: PlayerInfo | null;
  killed: PlayerInfo;
  weapon: Weapon | null;
  distance: Distance;
  entities: VehicleList;
  gameDate: Dayjs;
};
type VehicleKilledParams = CommonParams & {
  killer: PlayerInfo;
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
  gameDate,
}: PlayerKilledParams): PlayersList => {
  const newPlayers = { ...players };

  if (!killer) {
    newPlayers[killedPlayer.id] = {
      ...newPlayers[killedPlayer.id],
      isDead: true,
    };

    return newPlayers;
  }

  const isSameSide = killer.side === killedPlayer.side;
  const isSuicide = killer.id === killedPlayer.id;

  const vehiclesList = Object.values(entities);
  const vehiclesByName = keyBy(vehiclesList, 'name');

  const isKillFromVehicle = weapon ? vehiclesByName[weapon] !== undefined : false;

  let {
    kills, teamkills, killsFromVehicle, weapons, vehicles, killed, teamkilled,
  } = killer;
  let {
    killers, teamkillers,
  } = killedPlayer;

  const killerName = getPlayerName(killer.name)[0];
  const killedName = getPlayerName(killedPlayer.name)[0];

  const killerId = getPlayerId(killerName, gameDate);
  const killedId = getPlayerId(killedName, gameDate);

  if (!(isSameSide || isSuicide)) {
    if (weapon) {
      if (isKillFromVehicle) {
        vehicles = calculateWeaponStatistics(weapon, distance, killer.vehicles);
        killsFromVehicle += 1;
      } else weapons = calculateWeaponStatistics(weapon, distance, killer.weapons);
    }

    kills += 1;

    killed = mergeOtherPlayers(killed, [{ id: killedId, name: killedName, count: 1 }]);
    killers = mergeOtherPlayers(killers, [{ id: killerId, name: killerName, count: 1 }]);
  }

  if (isSameSide && !isSuicide) {
    teamkills += 1;

    teamkilled = mergeOtherPlayers(teamkilled, [{ id: killedId, name: killedName, count: 1 }]);
    teamkillers = mergeOtherPlayers(killers, [{ id: killerId, name: killerName, count: 1 }]);
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

const getKillsAndDeaths = (
  entities: VehiclesWithPlayersList,
  events: ReplayInfo['events'],
  gameDate: Dayjs,
): PlayersList => {
  let players = { ...entities.players };
  const { vehicles } = entities;

  events.forEach((event) => {
    const eventType = event[1];

    if (eventType === 'killed') {
      const [
        , ,
        killedId,
        killInfo,
        distance,
      ] = event;

      const killedPlayer = players[killedId];
      const killedVehicle = vehicles[killedId];

      if (killInfo[0] === 'null') {
        if (killedVehicle) return;

        if (killedPlayer) {
          players = processPlayerKilled({
            killer: null,
            killed: killedPlayer,
            players,
            distance,
            weapon: null,
            entities: vehicles,
            gameDate,
          });
        }

        return;
      }

      const [killerId, weapon] = killInfo;
      const killer = players[killerId];

      if (killer && killedPlayer) {
        players = processPlayerKilled({
          killer,
          killed: killedPlayer,
          players,
          distance,
          weapon: weapon || null,
          entities: vehicles,
          gameDate,
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
