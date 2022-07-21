type Frame = number;

type PlayerId = number;
type PlayerSide = 'EAST' | 'WEST' | 'GUER' | 'CIV';

type KillerWeaponName = string;
type Distance = number;
type KilledPlayerId = PlayerId;
type KillerPlayerId = PlayerId;

type ConnectEvent = [Frame, 'connected' | 'disconnected', PlayerName, PlayerId | undefined];
type KillEvent = [Frame, 'killed', KilledPlayerId, [KillerPlayerId, KillerWeaponName], Distance];

type Entity = {
  description: string;
  framesFires: any[];
  isPlayer: 0 | 1;
  type: 'unit' | 'vehicle';
  startFrameNum: number;
  positions: any[];
  side: PlayerSide;
  id: PlayerId;
  name: PlayerName;
  group: string;
};

type ReplayInfo = {
  playersCount: number[];
  endFrame: number;
  captureDelay: number;
  events: (ConnectEvent | KillEvent)[];
  entities: Entity[];
  EditorMarkers: any[];
  Markers: any[];
  missionAuthor: string;
  mission_name: string;
  world_name: string;
};

type PlayerInfo = {
  id: PlayerId;
  name: PlayerName;
  side: PlayerSide;
  kills: number;
  teamkills: number;
  isDead: boolean;
  isDeadByTeamkill: boolean;
  weapons: WeaponStatistic[];
};
type PlayersList = Record<PlayerId, PlayerInfo>;

type PlayersGameResultWithDate = {
  result: PlayersList,
  date: Replay['date'],
};

type GameType = 'sg' | 'mace';

type FormattedGameType = 'SG' | 'Mace';
