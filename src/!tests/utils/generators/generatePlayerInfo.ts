import getNameById from '../getNameById';
import generateDefaultWeapons from './generateDefaultWeapons';

type GeneratePlayerInfo = {
  id: PlayerInfo['id'];
  name?: PlayerInfo['name'];
  side?: GeneratorSide;
  kills?: PlayerInfo['kills'];
  vehicleKills?: PlayerInfo['vehicleKills'];
  teamkills?: PlayerInfo['teamkills'];
  isDead?: PlayerInfo['isDead'];
  isDeadByTeamkill?: PlayerInfo['isDeadByTeamkill'];
  weapons?: PlayerInfo['weapons'];
};

const generatePlayerInfo = ({
  id,
  name,
  side,
  kills,
  vehicleKills,
  teamkills,
  isDead,
  isDeadByTeamkill,
  weapons,
}: GeneratePlayerInfo): PlayerInfo => ({
  id,
  name: name || getNameById(id),
  side: side || 'EAST',
  kills: kills || 0,
  vehicleKills: vehicleKills || 0,
  teamkills: teamkills || 0,
  isDead: isDead || false,
  isDeadByTeamkill: isDeadByTeamkill || false,
  weapons: weapons || generateDefaultWeapons(kills || 0),
});

export default generatePlayerInfo;
