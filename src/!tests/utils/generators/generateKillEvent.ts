import { defaultDistance, defaultWeapon } from '../consts';

type GenerateKillEvent = {
  killedId: KillEvent[2],
  killerId: KillEvent[3][0],
  killerWeapon?: KillEvent[3][1],
  distance?: KillEvent[4],
};

const generateKillEvent = ({
  killerId,
  killedId,
  killerWeapon,
  distance,
}: GenerateKillEvent): KillEvent => ([
  0,
  'killed',
  killedId,
  [killerId, killerWeapon || defaultWeapon],
  distance || defaultDistance,
]);

export default generateKillEvent;
