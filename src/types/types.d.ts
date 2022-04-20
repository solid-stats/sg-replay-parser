type Frame = number;

type PlayerName = string;
type PlayerId = number;
type PlayerSide = 'EAST' | 'WEST' | 'GUER' | 'CIV';

type KillerWeaponName = string;
type Distance = number;
type KilledPlayerId = PlayerId;
type KillerPlayerId = PlayerId;

type ConnectEvent = [Frame, 'connected' | 'disconnected', PlayerName, PlayerId];
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
  missionName: string;
  worldName: string;
};

type PlayerInfo = {
  id: PlayerId;
  name: PlayerName;
  side: PlayerSide;
  kills: number;
  teamkills: number;
  isDead: Boolean;
};
type PlayersList = Record<PlayerId, PlayerInfo>;
