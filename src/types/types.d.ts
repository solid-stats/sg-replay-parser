type PlayerName = string;
type PlayerPrefix = string | null;

type Replay = {
  id: string;
  world_name: string;
  mission_name: string;
  mission_duration: number;
  filename: string;
  date: string;
  serverId: number;
};
