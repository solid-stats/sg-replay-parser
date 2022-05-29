type PlayerName = string;
type PlayerPrefix = string | null;
type Weapon = string;

type ReplayRaw = {
  id: string;
  world_name: string;
  mission_name: string;
  mission_duration: number;
  filename: string;
  date: string;
  serverId: number;
};

type Replay = Omit<ReplayRaw, 'date'> & { date: Date };

type Rotation = [startDate: Date, endDate: Date | null];

type WeaponStatistic = {
  name: Weapon,
  kills: number,
  maxDistance: number,
};
