import {
  defaultKilledName, defaultKillerName, defaultTeamkilledName, defaultTeamkillerName,
} from '../consts';

type Params = {
  kills: PlayerInfo['kills'];
  teamkills: PlayerInfo['teamkills'];
  isDead: PlayerInfo['isDead'];
  isDeadByTeamkill: PlayerInfo['isDeadByTeamkill'];
};

type Return = {
  killed: PlayerInfo['killed'];
  killers: PlayerInfo['killers'];
  teamkilled: PlayerInfo['teamkilled'];
  teamkillers: PlayerInfo['teamkillers'];
};

const generateDefaultOtherPlayers = ({
  kills,
  teamkills,
  isDead,
  isDeadByTeamkill,
}: Params): Return => {
  const killed = kills > 0
    ? [{ id: defaultKilledName, name: defaultKilledName, count: kills }]
    : [];
  const killers = isDead && !isDeadByTeamkill
    ? [{ id: defaultKillerName, name: defaultKillerName, count: 1 }]
    : [];
  const teamkilled = teamkills > 0
    ? [{ id: defaultTeamkilledName, name: defaultTeamkilledName, count: teamkills }]
    : [];
  const teamkillers = isDead && isDeadByTeamkill
    ? [{ id: defaultTeamkillerName, name: defaultTeamkillerName, count: 1 }]
    : [];

  return {
    killed,
    killers,
    teamkilled,
    teamkillers,
  };
};

export default generateDefaultOtherPlayers;
