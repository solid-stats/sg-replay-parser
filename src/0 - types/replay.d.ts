type Frame = number;

type EntityId = number;
type EntitySide = 'EAST' | 'WEST' | 'GUER' | 'CIV' | 'UNKNOWN';

type KillerWeaponName = string;
type Distance = number;
type KilledEntityId = EntityId;
type KillerEntityId = EntityId;

type ConnectEvent = [Frame, 'connected' | 'disconnected', PlayerName, EntityId | undefined];
type KillEvent = [Frame, 'killed', KilledEntityId, [KillerEntityId, KillerWeaponName], Distance];

type RawVehicleClass = 'parachute' | 'car' | 'truck' | 'plane' | 'sea' | 'apc' | 'heli' | 'tank' | 'static-weapon';
type VehicleClass = Omit<RawVehicleClass, 'parachute' | 'static-weapon' | 'sea'>;
type VehiclePositions = [unkwn: unknown[], unkwn: unknown, unkwn: unknown, playersInside: number[]];

type Entity = {
  description: string;
  framesFires: any[];
  isPlayer: 0 | 1;
  type: 'unit' | 'vehicle';
  class: RawVehicleClass;
  startFrameNum: number;
  positions: VehiclePositions[];
  side: EntitySide;
  id: EntityId;
  name: EntityName;
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

type FormattedGameType = 'SG' | 'Mace';
