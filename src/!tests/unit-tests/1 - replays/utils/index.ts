export const defaultName = 'some_name';

const defaultWeapon = 'M4A1';

const defaultDistance = 100;

export const getNameById = (id: Entity['id']) => `some_name_${id + 1}`;

export const generateReplay = (
  gameType: GameType | SkippedGameTypes,
  filename: Replay['filename'],
  date?: Replay['date'],
): Replay => ({
  missionName: `${gameType}@${defaultName}`,
  date: date || 'some_date',
  filename,
  replayLink: '/replays/123',
  serverId: 1,
  worldName: 'unknown',
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

type GenerateEntity = {
  isPlayer: Entity['isPlayer'],
  type: Entity['type'],
  side: Entity['side'],
  id: Entity['id'],
  name?: Entity['name'],
  vehicleClass?: Entity['class'],
};

export const generateEntity = ({
  isPlayer,
  type,
  side,
  id,
  name,
  vehicleClass,
}: GenerateEntity): Entity => ({
  description: defaultName,
  framesFires: [],
  isPlayer,
  type,
  class: vehicleClass,
  startFrameNum: 0,
  positions: [],
  side,
  id,
  name: name || defaultName,
  group: defaultName,
});

export const generateConnectEvent = (
  id: ConnectEvent[3],
  name?: ConnectEvent[2],
): ConnectEvent => ([
  0,
  'connected',
  name || defaultName,
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

export const generateDefaultWeapons = (kills: WeaponStatistic['kills']): WeaponStatistic[] => ([{
  name: defaultWeapon,
  kills,
  maxDistance: defaultDistance,
}])
