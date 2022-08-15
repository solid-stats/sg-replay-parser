type GeneratorSide = Exclude<EntitySide, 'WEST' | 'CIV' | 'UNKNOWN'>;

const defaultName = 'some_name';

export const getDefaultMissionName = (gameType?: GameType) => `${gameType || 'sg'}@${defaultName}`;

const defaultWeapon = 'M4A1';

const defaultDistance = 100;

export const getNameById = (id: EntityId) => `some_name_${id + 1}`;

export const generateReplay = (
  gameType: GameType | SkippedGameTypes,
  filename: Replay['filename'],
  date?: Replay['date'],
): Replay => ({
  mission_name: `${gameType}@${defaultName}`,
  date: date || 'some_date',
  filename,
  replayLink: '/replays/123',
  serverId: 1,
  world_name: 'unknown',
});

export const generateReplayInfo = (
  events: ReplayInfo['events'],
  entities: ReplayInfo['entities'],
): ReplayInfo => ({
  playersCount: [74, 0, 85, 0],
  endFrame: 800,
  captureDelay: 5,
  events,
  entities,
  EditorMarkers: [],
  Markers: [],
  missionAuthor: defaultName,
  missionName: defaultName,
  worldName: 'unknown',
});

type GeneratePlayerEntity = {
  id: PlayerEntity['id'];
  side: PlayerEntity['side'];
  isPlayer?: PlayerEntity['isPlayer'];
  name?: PlayerEntity['name'];
};

export const generatePlayerEntity = ({
  isPlayer,
  side,
  id,
  name,
}: GeneratePlayerEntity): PlayerEntity => ({
  description: defaultName,
  framesFires: [],
  isPlayer: isPlayer === undefined ? 1 : 0,
  startFrameNum: 0,
  positions: [],
  side,
  id,
  name: name || getNameById(id),
  group: defaultName,
  type: 'unit',
});

type GenerateVehicleEntity = {
  id: VehicleEntity['id'];
  vehicleClass: VehicleEntity['vehicleClass'];
  name?: VehicleEntity['name'];
};

export const generateVehicleEntity = ({
  id,
  vehicleClass,
  name,
}: GenerateVehicleEntity): VehicleEntity => ({
  framesFires: [],
  type: 'vehicle',
  vehicleClass,
  startFrameNum: 0,
  positions: [],
  id,
  name: name || getNameById(id),
});

export const generateConnectEvent = (
  id: ConnectEvent[3],
  name?: ConnectEvent[2],
): ConnectEvent => ([
  0,
  'connected',
  name || getNameById(id),
  id,
]);

type GenerateKillEvent = {
  killedId: KillEvent[2],
  killerId: KillEvent[3][0],
  killerWeapon?: KillEvent[3][1],
  distance?: KillEvent[4],
};

export const generateKillEvent = ({
  killedId,
  killerId,
  killerWeapon,
  distance,
}: GenerateKillEvent): KillEvent => ([
  0,
  'killed',
  killedId,
  [killerId, killerWeapon || defaultWeapon],
  distance || defaultDistance,
]);

export const generateDefaultWeapons = (kills: WeaponStatistic['kills']): WeaponStatistic[] => (kills ? [{
  name: defaultWeapon,
  kills,
  maxDistance: defaultDistance,
}] : []);

type GeneratePlayerInfo = {
  id: PlayerInfo['id'];
  name?: PlayerInfo['name'];
  side: GeneratorSide;
  kills?: PlayerInfo['kills'];
  vehicleKills?: PlayerInfo['vehicleKills'];
  teamkills?: PlayerInfo['teamkills'];
  isDead?: PlayerInfo['isDead'];
  isDeadByTeamkill?: PlayerInfo['isDeadByTeamkill'];
  weapons?: PlayerInfo['weapons'];
};

export const generatePlayerInfo = ({
  id,
  name,
  side,
  kills,
  vehicleKills,
  teamkills,
  isDead,
  isDeadByTeamkill,
  weapons,
}: GeneratePlayerInfo): PlayerInfo => ({
  id,
  name: name || getNameById(id),
  side,
  kills: kills || 0,
  vehicleKills: vehicleKills || 0,
  teamkills: teamkills || 0,
  isDead: isDead || false,
  isDeadByTeamkill: isDeadByTeamkill || false,
  weapons: weapons || generateDefaultWeapons(kills || 0),
});
