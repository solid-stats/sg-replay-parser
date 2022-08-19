type Frame = number;

type EntityId = number;
type EntitySide = 'EAST' | 'WEST' | 'GUER' | 'CIV' | 'UNKNOWN';

type KillerWeaponName = string;
type Distance = number;
type KilledEntityId = EntityId;
type KillerEntityId = EntityId;

type ConnectEvent = [Frame, 'connected' | 'disconnected', PlayerName, EntityId];
type KillEvent = [Frame, 'killed', KilledEntityId, [KillerEntityId, KillerWeaponName], Distance];

type RawVehicleClass = 'parachute' | 'car' | 'truck' | 'plane' | 'sea' | 'apc' | 'heli' | 'tank' | 'static-weapon';
type VehicleClass = Omit<RawVehicleClass, 'parachute' | 'static-weapon' | 'sea'>;
type VehiclePositions = [unkwn: unknown[], unkwn: unknown, unkwn: unknown, playersInside: number[]];

type CommonEntity = {
  id: EntityId;
  name: EntityName;
  framesFires: any[];
  startFrameNum: number;
  positions: VehiclePositions[];
};

type PlayerEntity = CommonEntity & {
  type: 'unit';
  description: string;
  isPlayer: 0 | 1;
  side: EntitySide;
  group: string;
};

type VehicleEntity = CommonEntity & {
  type: 'vehicle';
  vehicleClass: RawVehicleClass;
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
  vehicleKills: number;
  teamkills: number;
  isDead: boolean;
  isDeadByTeamkill: boolean;
  weapons: WeaponStatistic[];
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
