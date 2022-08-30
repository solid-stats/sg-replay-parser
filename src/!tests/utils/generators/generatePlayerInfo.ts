import getNameById from '../getNameById';
import generateDefaultWeapons from './generateDefaultWeapons';

type GeneratePlayerInfo = {
  id: PlayerInfo['id'];
  name?: PlayerInfo['name'];
  side?: GeneratorSide;
  kills?: PlayerInfo['kills'];
  killsFromVehicle?: PlayerInfo['killsFromVehicle'];
  vehicleKills?: PlayerInfo['vehicleKills'];
  teamkills?: PlayerInfo['teamkills'];
  isDead?: PlayerInfo['isDead'];
  isDeadByTeamkill?: PlayerInfo['isDeadByTeamkill'];
  weapons?: PlayerInfo['weapons'];
  vehicles?: PlayerInfo['vehicles'];
};

const generatePlayerInfo = ({
  id,
  name,
  side,
  kills,
  killsFromVehicle,
  vehicleKills,
  teamkills,
  isDead,
  isDeadByTeamkill,
  weapons: weap,
  vehicles,
}: GeneratePlayerInfo): PlayerInfo => {
  let weapons = weap;

  if (weap === undefined && kills !== undefined) {
    weapons = generateDefaultWeapons(
      killsFromVehicle !== undefined ? kills - killsFromVehicle : kills,
    );
  }

  return {
    id,
    name: name || getNameById(id),
    side: side || 'EAST',
    kills: kills || killsFromVehicle || 0,
    killsFromVehicle: killsFromVehicle || 0,
    vehicleKills: vehicleKills || 0,
    teamkills: teamkills || 0,
    isDead: isDead || false,
    isDeadByTeamkill: isDeadByTeamkill || false,
    weapons: weapons || generateDefaultWeapons(kills || 0),
    vehicles: vehicles || generateDefaultWeapons(killsFromVehicle || 0, 'vehicle'),
  };
};

export default generatePlayerInfo;
