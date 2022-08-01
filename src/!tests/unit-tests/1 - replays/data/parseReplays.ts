import {
  generateConnectEvent,
  generateReplay,
  generateReplayInfo,
  generateKillEvent,
  getNameById,
  generateDefaultWeapons,
  getDefaultMissionName,
  generatePlayerInfo,
  generatePlayerEntity,
  generateVehicleEntity,
} from '../utils';

type TestData = {
  replays: Replay[];
  replayInfo: Record<Replay['filename'], ReplayInfo>;
  result: PlayersGameResult[];
};

const dates: Replay['date'][] = [
  '2022-07-25T00:00:00.000Z',
  '2022-07-29T00:00:00.000Z',
  '2022-07-29T00:00:00.001Z',
];
const testData: TestData = {
  replays: [
    generateReplay('sg', 'file_3', dates[2]),
    generateReplay('sg', 'file_1', dates[0]),
    generateReplay('sg', 'file_2', dates[1]),
  ],
  replayInfo: {
    // default behaviour with players connected later than start
    file_1: generateReplayInfo(
      [
        generateConnectEvent(3, getNameById(3)),
        generateConnectEvent(0, getNameById(0)),
        generateKillEvent({ killerId: 0, killedId: 3 }),
        generateKillEvent({ killerId: 0, killedId: 6 }),
        generateKillEvent({ killerId: 5, killedId: 1 }),
        generateKillEvent({ killerId: 4, killedId: 5 }),
        generateKillEvent({ killerId: 0, killedId: 4 }),
      ],
      [
        generatePlayerEntity({
          id: 0,
          side: 'EAST',
        }),
        generatePlayerEntity({
          id: 1,
          side: 'EAST',
        }),
        generatePlayerEntity({
          id: 2,
          side: 'EAST',
        }),

        generatePlayerEntity({
          id: 3,
          side: 'GUER',
        }),
        generatePlayerEntity({
          id: 4,
          side: 'GUER',
        }),
        generatePlayerEntity({
          id: 5,
          side: 'GUER',
        }),
        generatePlayerEntity({
          isPlayer: 0,
          id: 6,
          side: 'GUER',
        }),
      ],
    ),
    // behaviour when player changes the game slot after start
    file_2: generateReplayInfo(
      [
        generateConnectEvent(1, getNameById(0)),
        generateConnectEvent(2, getNameById(0)),
        generateKillEvent({ killedId: 0, killerId: 3 }),
        generateKillEvent({ killedId: 1, killerId: 4 }),
      ],
      [
        generatePlayerEntity({
          id: 0,
          side: 'EAST',
        }),
        generatePlayerEntity({
          id: 1,
          side: 'EAST',
          name: '',
        }),
        generatePlayerEntity({
          id: 2,
          side: 'EAST',
          name: '',
        }),
        generatePlayerEntity({
          id: 3,
          side: 'EAST',
        }),
        generatePlayerEntity({
          id: 4,
          side: 'GUER',
        }),
      ],
    ),
    // behaviour with vehicle kills
    file_3: generateReplayInfo(
      [
        generateKillEvent({
          killedId: 4,
          killerId: 2,
          killerWeapon: 'BTR-82',
          distance: 100,
        }),
        generateKillEvent({
          killedId: 0,
          killerId: 6,
          killerWeapon: 'BTR-80A',
          distance: 100,
        }),
        generateKillEvent({
          killedId: 1,
          killerId: 6,
          killerWeapon: 'BTR-80A',
          distance: 150,
        }),
        generateKillEvent({
          killedId: 2,
          killerId: 6,
          killerWeapon: 'BTR-80A',
          distance: 150,
        }),
        generateKillEvent({
          killedId: 3,
          killerId: 6,
          killerWeapon: 'BTR-80A',
          distance: 150,
        }),
      ],
      [
        generatePlayerEntity({
          id: 0,
          side: 'EAST',
        }),
        generatePlayerEntity({
          id: 1,
          side: 'EAST',
        }),
        generatePlayerEntity({
          id: 2,
          side: 'EAST',
        }),
        generateVehicleEntity({
          id: 3,
          name: 'BTR-82',
          vehicleClass: 'apc',
        }),

        generatePlayerEntity({
          id: 4,
          side: 'GUER',
        }),
        generatePlayerEntity({
          id: 5,
          side: 'GUER',
        }),
        generatePlayerEntity({
          id: 6,
          side: 'GUER',
        }),
        generateVehicleEntity({
          id: 7,
          name: 'BTR-80A',
          vehicleClass: 'apc',
        }),
      ],
    ),
  },
  result: [
    // file_1
    {
      missionName: getDefaultMissionName(),
      date: dates[0],
      result: [
        generatePlayerInfo({
          id: 0,
          side: 'EAST',
          kills: 2,
          weapons: generateDefaultWeapons(2),
        }),
        generatePlayerInfo({
          id: 1,
          side: 'EAST',
          isDead: true,
        }),
        generatePlayerInfo({
          id: 2,
          side: 'EAST',
        }),
        generatePlayerInfo({
          id: 3,
          side: 'GUER',
          isDead: true,
        }),
        generatePlayerInfo({
          id: 4,
          side: 'GUER',
          teamkills: 1,
          isDead: true,
        }),
        generatePlayerInfo({
          id: 5,
          side: 'GUER',
          kills: 1,
          isDead: true,
          isDeadByTeamkill: true,
          weapons: generateDefaultWeapons(1),
        }),
      ],
    },
    // file_2
    {
      date: dates[1],
      missionName: getDefaultMissionName(),
      result: [
        generatePlayerInfo({
          id: 2,
          side: 'EAST',
          name: getNameById(0),
        }),
        generatePlayerInfo({
          id: 3,
          side: 'EAST',
        }),
        generatePlayerInfo({
          id: 4,
          side: 'GUER',
        }),
      ],
    },
    // file_3
    {
      date: dates[2],
      missionName: getDefaultMissionName(),
      result: [
        generatePlayerInfo({
          id: 0,
          side: 'EAST',
          isDead: true,
        }),
        generatePlayerInfo({
          id: 1,
          side: 'EAST',
          isDead: true,
        }),
        generatePlayerInfo({
          id: 2,
          side: 'EAST',
          kills: 1,
          isDead: true,
          weapons: [{ name: 'BTR-82', kills: 1, maxDistance: 100 }],
        }),
        generatePlayerInfo({
          id: 4,
          side: 'GUER',
          isDead: true,
        }),
        generatePlayerInfo({
          id: 5,
          side: 'GUER',
        }),
        generatePlayerInfo({
          id: 6,
          side: 'GUER',
          kills: 3,
          vehicleKills: 1,
          weapons: [{ kills: 3, maxDistance: 150, name: 'BTR-80A' }],
        }),
      ],
    },
  ],
};

export default testData;
