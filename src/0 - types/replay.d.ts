type Frame = number;
type Position = [x: number, y: number];
type Position3D = [x: number, y: number, z: number];

type EntityId = number;
type EntitySide = 'EAST' | 'WEST' | 'GUER' | 'CIV' | 'UNKNOWN';

type KillerWeaponName = string;
type Distance = number;
type KilledEntityId = EntityId;
type KillerEntityId = EntityId;
type OtherPlayer = {
  name: EntityName;
  count: number;
};

type ConnectEvent = [Frame, 'connected' | 'disconnected', PlayerName, EntityId];
type KillEvent = [Frame, 'killed', KilledEntityId, [KillerEntityId, KillerWeaponName], Distance];

type RawVehicleClass = 'parachute' | 'car' | 'truck' | 'plane' | 'sea' | 'apc' | 'heli' | 'tank' | 'static-weapon';
type VehicleClass = Omit<RawVehicleClass, 'parachute' | 'static-weapon' | 'sea'>;

declare enum ConsciousState {
  Dead,
  Conscious,
  Unconscious,
}

declare enum NumBool {
  True,
  False,
}

type PlayerPosition = [
  pos: Position,
  direction: number,
  consciousState: ConsciousState,
  isInVehicle: NumBool,
  name: string,
  isPlayer: NumBool,
];
type VehiclePosition = [
  pos: Position3D[],
  direction: number,
  isAlive: NumBool,
  playersInside: number[], // order like this [driver, gunner, commander, turrets, cargo]
];

type CommonEntity = {
  id: EntityId;
  name: EntityName;
  framesFires: any[];
  startFrameNum: number;
};

type PlayerEntity = CommonEntity & {
  type: 'unit';
  description: string;
  isPlayer: NumBool;
  side: EntitySide;
  group: string;
  positions: PlayerPosition[];
};

type VehicleEntity = CommonEntity & {
  type: 'vehicle';
  vehicleClass: RawVehicleClass;
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
  vehicleClass: VehicleClass;
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

type GameType = 'sg' | 'mace';
type SkippedGameTypes = 'sgs';

type FormattedGameType = 'SG' | 'Mace';
