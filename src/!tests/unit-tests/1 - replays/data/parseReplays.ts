import {
  generateConnectEvent,
  generateEntity,
  generateReplay,
  generateReplayInfo,
  generateKillEvent,
  defaultName,
  getNameById,
  generateDefaultWeapons,
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
    // generateReplay('sg', 'file_2', dates[1]),
  ],
  replayInfo: {
    // default behaviour with players connected later than start
    file_1: generateReplayInfo(
      [
        generateConnectEvent(3, getNameById(3)),
        generateConnectEvent(0, getNameById(0)),
        generateKillEvent({ killerId: 0, killedId: 3 }),
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
      ],
    ),
  },
  result: [
    // file_1
    {
      missionName: `sg@${defaultName}`,
      date: dates[0],
      result: [
        {
          id: 0,
          name: getNameById(0),
          side: 'EAST',
          kills: 2,
          vehicleKills: 0,
          teamkills: 0,
          isDead: false,
          isDeadByTeamkill: false,
          weapons: generateDefaultWeapons(2),
        },
        {
          id: 1,
          name: getNameById(1),
          side: 'EAST',
          kills: 0,
          vehicleKills: 0,
          teamkills: 0,
          isDead: true,
          isDeadByTeamkill: false,
          weapons: [],
        },
        {
          id: 2,
          name: getNameById(2),
          side: 'EAST',
          kills: 0,
          vehicleKills: 0,
          teamkills: 0,
          isDead: false,
          isDeadByTeamkill: false,
          weapons: [],
        },
        {
          id: 3,
          name: getNameById(3),
          side: 'GUER',
          kills: 0,
          vehicleKills: 0,
          teamkills: 0,
          isDead: true,
          isDeadByTeamkill: false,
          weapons: [],
        },
        {
          id: 4,
          name: getNameById(4),
          side: 'GUER',
          kills: 0,
          vehicleKills: 0,
          teamkills: 1,
          isDead: true,
          isDeadByTeamkill: false,
          weapons: [],
        },
        {
          id: 5,
          name: getNameById(5),
          side: 'GUER',
          kills: 1,
          vehicleKills: 0,
          teamkills: 0,
          isDead: true,
          isDeadByTeamkill: true,
          weapons: generateDefaultWeapons(1),
        },
      ],
    },
  ],
};

export default testData;
