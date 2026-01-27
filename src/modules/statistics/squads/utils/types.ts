export type SquadInfo = {
  name: string,
  gamesPlayed: number,
  playersCount: number,
  kills: number,
  teamkills: number,
  players: Record<PlayerId, SimplifiedGlobalPlayerStatistics>,
};
