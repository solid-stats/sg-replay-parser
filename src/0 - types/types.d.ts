type PlayerName = string;
type EntityName = string;
type PlayerPrefix = string | null;
type Weapon = string;

type Replay = {
  mission_name: string;
  world_name: string | 'unknown';
  serverId: number;
  date: string;
  filename: string;
  replayLink: string;
};

type WeaponStatistic = {
  name: Weapon;
  kills: number;
  maxDistance: number;
};
