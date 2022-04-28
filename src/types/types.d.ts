type PlayerName = string;
type PlayerPrefix = string | null;

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
