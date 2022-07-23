import { addWeaponStatistic, filterWeaponStatistics } from '../0 - utils/weaponsStatistic';

type CommonParams = {
  killer: PlayerInfo;
  players: PlayersList;
  weapon: Weapon;
  distance: Distance;
};

type PlayerKilledParams = CommonParams & {
  killed: PlayerInfo;
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
  killed,
  players,
  distance,
  weapon,
}: PlayerKilledParams): PlayersList => {
  const newPlayers = { ...players };
  const isSameSide = killer.side === killed.side;
  const isSuicide = killer.id === killed.id;

  const weapons = isSameSide || isSuicide
    ? killer.weapons
    : calculateWeaponStatistics(weapon, distance, killer.weapons);

  newPlayers[killed.id] = {
    ...newPlayers[killed.id],
    isDead: true,
    isDeadByTeamkill: isSuicide ? false : isSameSide,
  };
  newPlayers[killer.id] = {
    ...newPlayers[killer.id],
    kills: isSameSide || isSuicide ? killer.kills : killer.kills + 1,
    teamkills: isSameSide && !isSuicide ? killer.teamkills + 1 : killer.teamkills,
    weapons,
  };

  return newPlayers;
};

const processVehicleKilled = ({
  killer,
  vehicle,
  players,
  distance,
  weapon,
}: VehicleKilledParams): PlayersList => {
  if (killer.id === vehicle.id) return players;

  const newPlayers = { ...players };

  const weapons = calculateWeaponStatistics(weapon, distance, killer.weapons);

  newPlayers[killer.id] = {
    ...newPlayers[killer.id],
    vehicleKills: killer.vehicleKills + 1,
    weapons,
  };

  return newPlayers;
};

const getKillsAndDeaths = (entities: VehiclesWithPlayersList, events: ReplayInfo['events']): PlayersList => {
  let players = { ...entities.players };

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
      const killedVehicle = entities.vehicles[killedId];

      if (killer && killedPlayer) {
        players = processPlayerKilled({
          killer, killed: killedPlayer, players, distance, weapon,
        });

        return;
      }

      if (killer && killedVehicle) {
        players = processVehicleKilled({
          killer, vehicle: killedVehicle, players, distance, weapon,
        });
      }
    }
  });

  return players;
};

export default getKillsAndDeaths;
