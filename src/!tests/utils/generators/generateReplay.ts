import { defaultName } from '../consts';

const generateReplay = (
  gameType: GameType | SkippedGameTypes,
  filename: Replay['filename'],
  date?: Replay['date'],
): Replay => ({
  mission_name: `${gameType}@${defaultName}`,
  date: date || 'some_date',
  filename,
  replayLink: '/replays/0',
  serverId: 1,
  world_name: 'unknown',
});

export default generateReplay;
