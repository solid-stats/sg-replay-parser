type PlayersBySquadPrefix = Record<string, GlobalPlayerStatistics[]>;

type SquadInfo = {
  playersCount: number,
  kills: number,
  teamkills: number,
  score: number,
};
type AverageSquadsInfoByPrefix = Record<string, SquadInfo>;
