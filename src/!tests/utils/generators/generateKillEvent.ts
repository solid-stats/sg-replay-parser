import { defaultDistance, defaultWeapon } from '../consts';

type GenerateKillEvent = {
  killedId: EntityId,
  killInfo?: KillEvent[3];
  killerId?: EntityId,
  killerWeapon?: KillEvent[3][1],
  distance?: KillEvent[4],
};

const generateKillEvent = ({
  killerId,
  killedId,
  killerWeapon,
  killInfo,
  distance,
}: GenerateKillEvent): KillEvent => {
  const info: KillEvent[3] = killInfo || [killerId ?? -1, killerWeapon || defaultWeapon];

  return [
    0,
    'killed',
    killedId,
    info,
    distance || defaultDistance,
  ];
};

export default generateKillEvent;
