import {
  generateConnectEvent,
  generateEntity,
  generateReplay,
  generateReplayInfo,
  generateKillEvent,
  getNameById,
  generateDefaultWeapons,
  getDefaultMissionName,
  generatePlayerInfo,
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
    // generateReplay('sg', 'file_3', dates[2]),
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
        generateEntity({
          isPlayer: 1,
          id: 0,
          type: 'unit',
          side: 'EAST',
        }),
        generateEntity({
          isPlayer: 1,
          id: 1,
          type: 'unit',
          side: 'EAST',
          name: getNameById(1),
        }),
        generateEntity({
          isPlayer: 1,
          id: 2,
          type: 'unit',
          side: 'EAST',
          name: getNameById(2),
        }),

        generateEntity({
          isPlayer: 1,
          id: 3,
          type: 'unit',
          side: 'GUER',
        }),
        generateEntity({
          isPlayer: 1,
          id: 4,
          type: 'unit',
          side: 'GUER',
          name: getNameById(4),
        }),
        generateEntity({
          isPlayer: 1,
          id: 5,
          type: 'unit',
          side: 'GUER',
          name: getNameById(5),
        }),
        generateEntity({
          isPlayer: 0,
          id: 6,
          type: 'unit',
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
        generateEntity({
          isPlayer: 1,
          id: 0,
          type: 'unit',
          side: 'EAST',
        }),
        generateEntity({
          isPlayer: 1,
          id: 1,
          type: 'unit',
          side: 'EAST',
          name: '',
        }),
        generateEntity({
          isPlayer: 1,
          id: 2,
          type: 'unit',
          side: 'EAST',
          name: '',
        }),
        generateEntity({
          isPlayer: 1,
          id: 3,
          type: 'unit',
          side: 'EAST',
        }),
        generateEntity({
          isPlayer: 1,
          id: 4,
          type: 'unit',
          side: 'GUER',
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
  ],
};

export default testData;
