type PlayerName = string;
type EntityName = string;
type PlayerPrefix = string | null;
type Weapon = string;

type ReplayRaw = {
  mission_name: string;
  world_name: string;
  serverId: number;
  date: string;
  filename: string;
  replayLink: string;
};

type Replay = Omit<ReplayRaw, 'date'> & { date: string };

type WeaponStatistic = {
  name: Weapon;
  kills: number;
  maxDistance: number;
};
