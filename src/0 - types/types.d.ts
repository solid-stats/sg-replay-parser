type PlayerName = string;
type PlayerPrefix = string | null;
type Weapon = string;

type ReplayRaw = {
  mission_name: string;
  world_name: string;
  serverId: number;
  date: string;
  filename: string;
};

type Replay = Omit<ReplayRaw, 'date'> & { date: Date };

type Rotation = [startDate: Date, endDate: Date | null];

type WeaponStatistic = {
  name: Weapon,
  kills: number,
  maxDistance: number,
};
