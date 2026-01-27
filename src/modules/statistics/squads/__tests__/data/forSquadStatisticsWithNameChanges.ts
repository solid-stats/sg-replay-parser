/* eslint-disable object-curly-newline */
import generatePlayerInfo from '../../../../../shared/testing/generators/generatePlayerInfo';

const getDummies = (prefix: string = 'A'): PlayerInfo[] => [
  generatePlayerInfo({ id: 10, name: `[${prefix}]Dummy_1` }),
  generatePlayerInfo({ id: 11, name: `[${prefix}]Dummy_2` }),
  generatePlayerInfo({ id: 12, name: `[${prefix}]Dummy_3` }),
  generatePlayerInfo({ id: 13, name: `[${prefix}]Dummy_4` }),
];

export const nameChangesTestData: PlayersGameResult[] = [
  {
    date: '2023-04-07T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[A]Markovnik', kills: 3, isDead: true }),
      ...getDummies(),
    ],
  },
  {
    date: '2023-04-14T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[A]borigen', kills: 7, killsFromVehicle: 4, isDead: true, isDeadByTeamkill: true }),
      ...getDummies(),
    ],
  },
];

export const nameChangesSequenceTestData: PlayersGameResult[] = [
  {
    date: '2023-08-11T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]callisto1', kills: 1 }),
      ...getDummies('W8'),
    ],
  },
  {
    date: '2023-08-18T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]Outkast', kills: 2, killsFromVehicle: 1, isDead: true, isDeadByTeamkill: true }),
      ...getDummies('W8'),
    ],
  },
  {
    date: '2023-08-25T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]kanistra', kills: 3, isDead: true }),
      ...getDummies('W8'),
    ],
  },
  {
    date: '2023-09-01T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]AllCash', kills: 4, killsFromVehicle: 4, isDead: true, isDeadByTeamkill: true }),
      ...getDummies('W8'),
    ],
  },
];

export const nameChangeAndChangeBackTestData: PlayersGameResult[] = [
  {
    date: '2022-11-11T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]Parker', kills: 1 }),
      ...getDummies('W8'),
    ],
  },
  {
    date: '2022-11-12T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]morpex', kills: 2, killsFromVehicle: 1, isDead: true }),
      generatePlayerInfo({ id: 1, name: '[W8]stolfo' }),
      ...getDummies('W8'),
    ],
  },
  {
    date: '2022-11-18T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]Parker', kills: 4, killsFromVehicle: 3, isDead: true, isDeadByTeamkill: true }),
      ...getDummies('W8'),
    ],
  },
];

// eslint-disable-next-line id-length
export const nameChangeAndChangeBackWithCollisionsTestData: PlayersGameResult[] = [
  {
    date: '2023-08-04T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]neon', kills: 1 }),
      generatePlayerInfo({ id: 1, name: '[W8]Londor', kills: 5, isDead: true, isDeadByTeamkill: true }),
      ...getDummies('W8'),
    ],
  },
  {
    date: '2023-08-05T18:00:00.000Z',
    missionName: '',
    result: [
      // neon
      generatePlayerInfo({ id: 0, name: '[W8]beda', kills: 2, isDead: true }),
      // Londor
      generatePlayerInfo({ id: 1, name: '[W8]neon', kills: 2 }),
      ...getDummies('W8'),
    ],
  },
  {
    date: '2023-08-11T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]neon', kills: 2, isDead: true }),
      generatePlayerInfo({ id: 1, name: '[W8]Londor', kills: 3, isDead: true }),
      ...getDummies('W8'),
    ],
  },
];

export const nameChangeAfterSquadChangeTestData: PlayersGameResult[] = [
  {
    date: '2023-04-07T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[A]Markovnik', kills: 5, isDead: true }),
      ...getDummies(),
    ],
  },
  {
    date: '2023-04-14T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]borigen', kills: 10, killsFromVehicle: 2, isDead: true, isDeadByTeamkill: true }),
      ...getDummies('W8'),
    ],
  },
];
