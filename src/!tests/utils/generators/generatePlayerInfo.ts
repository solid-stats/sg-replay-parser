import getNameById from '../getNameById';
import generateDefaultOtherPlayers from './generateDefaultOtherPlayers';
import generateDefaultWeapons from './generateDefaultWeapons';

type GeneratePlayerInfo = {
  id: PlayerInfo['id'];
  name?: PlayerInfo['name'];
  prefix?: PlayerPrefix;
  side?: GeneratorSide;
  kills?: PlayerInfo['kills'];
  killsFromVehicle?: PlayerInfo['killsFromVehicle'];
  vehicleKills?: PlayerInfo['vehicleKills'];
  teamkills?: PlayerInfo['teamkills'];
  isDead?: PlayerInfo['isDead'];
  isDeadByTeamkill?: PlayerInfo['isDeadByTeamkill'];
  weapons?: PlayerInfo['weapons'];
  vehicles?: PlayerInfo['vehicles'];
  killed?: PlayerInfo['killed'];
  killers?: PlayerInfo['killers'];
  teamkilled?: PlayerInfo['teamkilled'];
  teamkillers?: PlayerInfo['teamkillers'];
};

const generatePlayerInfo = ({
  id,
  name,
  prefix,
  side,
  kills,
  killsFromVehicle,
  vehicleKills,
  teamkills,
  isDead,
  isDeadByTeamkill,
  weapons: weap,
  vehicles,
  killed,
  killers,
  teamkilled,
  teamkillers,
}: GeneratePlayerInfo): PlayerInfo => {
  let weapons = weap;

  if (weap === undefined && kills !== undefined) {
    weapons = generateDefaultWeapons(
      killsFromVehicle !== undefined ? kills - killsFromVehicle : kills,
    );
  }

  const resultKills = kills || killsFromVehicle || 0;
  const resultTeamkills = teamkills || 0;
  const resultIsDead = isDead || false;
  const resultIsDeadByTeamkill = isDeadByTeamkill || false;

  const otherPlayersStats = generateDefaultOtherPlayers({
    kills: resultKills,
    teamkills: resultTeamkills,
    isDead: resultIsDead,
    isDeadByTeamkill: resultIsDeadByTeamkill,
  });

  return {
    id,
    name: name || getNameById(id, prefix),
    side: side || 'EAST',
    kills: resultKills,
    killsFromVehicle: killsFromVehicle || 0,
    vehicleKills: vehicleKills || 0,
    teamkills: teamkills || 0,
    isDead: resultIsDead,
    isDeadByTeamkill: resultIsDeadByTeamkill,
    weapons: weapons || generateDefaultWeapons(kills || 0),
    vehicles: vehicles || generateDefaultWeapons(killsFromVehicle || 0, 'vehicle'),
    killed: killed || otherPlayersStats.killed,
    killers: killers || otherPlayersStats.killers,
    teamkilled: teamkilled || otherPlayersStats.teamkilled,
    teamkillers: teamkillers || otherPlayersStats.teamkillers,
  };
};

export default generatePlayerInfo;
