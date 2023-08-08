type FrameId = number;
type Position = [x: number, y: number];
type Position3D = [x: number, y: number, z: number];

type EntityId = number;
type EntitySide = 'EAST' | 'WEST' | 'GUER' | 'CIV' | 'UNKNOWN';

type KillerWeaponName = string;
type Distance = number;
type KilledEntityId = EntityId;
type KillerEntityId = EntityId;
type OtherPlayer = {
  id: PlayerId;
  name: EntityName;
  count: number;
};

type ConnectEvent = [frameId: FrameId, eventType: 'connected' | 'disconnected', playerName: PlayerName, entityId: EntityId];
type KillEvent = [frameId: FrameId, eventType: 'killed', killedId: KilledEntityId, killInfo: [killerId: KillerEntityId, weapon: KillerWeaponName | undefined] | ['null'], distance: Distance];

type RawVehicleClass = 'parachute' | 'car' | 'truck' | 'plane' | 'sea' | 'apc' | 'heli' | 'tank' | 'static-weapon';
type VehicleClass = Omit<RawVehicleClass, 'parachute' | 'static-weapon' | 'sea'>;

// dead | conscious | unconscious
type ConsciousState = 0 | 1 | 2;

type PlayerPosition = [
  pos: Position,
  direction: number,
  consciousState: ConsciousState,
  isInVehicle: 0 | 1,
  name: string,
  isPlayer: 0 | 1,
];
type VehiclePosition = [
  pos: Position3D,
  direction: number,
  isAlive: 0 | 1,
  playersInside: number[], // order like this [driver, gunner, commander, turrets, cargo]
];

type CommonEntity = {
  id: EntityId;
  name: EntityName;
  framesFired: [FrameId, Position][];
  startFrameNum: number;
};

type PlayerEntity = CommonEntity & {
  type: 'unit';
  description: string;
  isPlayer: 0 | 1;
  side: EntitySide;
  group: string;
  positions: PlayerPosition[];
};

type VehicleEntity = CommonEntity & {
  type: 'vehicle';
  class: RawVehicleClass;
  positions: VehiclePosition[];
};

type ReplayInfo = {
  playersCount: number[];
  endFrame: number;
  captureDelay: number;
  events: (ConnectEvent | KillEvent)[];
  entities: Array<PlayerEntity | VehicleEntity>;
  EditorMarkers: any[];
  Markers: any[];
  missionAuthor: string;
  missionName: string;
  worldName: string;
};

type PlayerInfo = {
  id: EntityId;
  name: PlayerName;
  side: EntitySide;
  kills: number;
  killsFromVehicle: number;
  vehicleKills: number;
  teamkills: number;
  isDead: boolean;
  isDeadByTeamkill: boolean;
  weapons: WeaponStatistic[];
  vehicles: WeaponStatistic[];
  killers: OtherPlayer[];
  killed: OtherPlayer[];
  teamkillers: OtherPlayer[];
  teamkilled: OtherPlayer[];
};
type PlayersList = Record<EntityId, PlayerInfo>;

type VehicleInfo = {
  id: EntityId;
  name: EntityName;
  class: RawVehicleClass;
};

type VehicleList = Record<EntityId, VehicleInfo>;

type VehiclesWithPlayersList = {
  vehicles: VehicleList;
  players: PlayersList;
};

type PlayersGameResult = {
  result: PlayerInfo[];
  date: Replay['date'];
  missionName: Replay['mission_name'];
};

type GameType = 'sg' | 'mace' | 'sm';
type SkippedGameTypes = 'sgs';

type FormattedGameType = 'SG' | 'Mace' | 'SM';
