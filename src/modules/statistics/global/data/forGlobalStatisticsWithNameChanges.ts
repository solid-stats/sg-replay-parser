/* eslint-disable object-curly-newline */
import { dayjsUTC } from '../../../../shared/utils/dayjs';
import { getPlayerId } from '../../../../shared/utils/namesHelper/getId';
import generatePlayerInfo from '../../../../shared/testing/generators/generatePlayerInfo';

export const nameChangesTestData: PlayersGameResult[] = [
  {
    date: '2023-04-07T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[A]Markovnik', kills: 3, isDead: true }),
    ],
  },
  {
    date: '2023-04-14T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[A]borigen', kills: 7, killsFromVehicle: 4, isDead: true, isDeadByTeamkill: true }),
      generatePlayerInfo({ id: 1, name: '[A]stolfo' }),
    ],
  },
];

export const nameChangesSequenceTestData: PlayersGameResult[] = [
  {
    date: '2022-12-16T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]callisto1', kills: 1 }),
    ],
  },
  {
    date: '2023-04-23T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]Outkast', kills: 2, killsFromVehicle: 1, isDead: true, isDeadByTeamkill: true }),
      generatePlayerInfo({ id: 1, name: '[A]stolfo' }),
    ],
  },
  {
    date: '2023-06-30T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]kanistra', kills: 3, isDead: true }),
      generatePlayerInfo({ id: 1, name: '[A]mogus' }),
    ],
  },
  {
    date: '2023-09-01T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]AllCash', kills: 4, killsFromVehicle: 4, isDead: true, isDeadByTeamkill: true }),
    ],
  },
];

export const nameChangeAndChangeBackTestData: PlayersGameResult[] = [
  {
    date: '2022-11-11T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]Parker', kills: 1 }),
    ],
  },
  {
    date: '2022-11-12T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]morpex', kills: 2, killsFromVehicle: 1, isDead: true }),
      generatePlayerInfo({ id: 1, name: '[A]stolfo' }),
    ],
  },
  {
    date: '2022-12-30T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]Parker', kills: 4, killsFromVehicle: 3, isDead: true, isDeadByTeamkill: true }),
    ],
  },
];

// eslint-disable-next-line id-length
export const nameChangeAndChangeBackWithCollisionsTestData: PlayersGameResult[] = [
  {
    date: '2023-01-27T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]neon', kills: 1 }),
      generatePlayerInfo({ id: 1, name: '[A]Londor', kills: 5, isDead: true, isDeadByTeamkill: true }),
    ],
  },
  {
    date: '2023-03-03T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]beda', kills: 2, isDead: true }),
      generatePlayerInfo({ id: 1, name: '[A]neon', kills: 2 }),
    ],
  },
  {
    date: '2023-05-05T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[W8]neon', kills: 2, isDead: true }),
      generatePlayerInfo({ id: 1, name: '[A]Londor', kills: 3, isDead: true }),
    ],
  },
];

// eslint-disable-next-line id-length
export const otherPlayersStatisticsWithNameChangesTestData = (): PlayersGameResult[] => [
  {
    date: '2022-11-04T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({
        id: 0,
        name: '[W8]callisto1',
        kills: 3,
        killed: [{
          id: getPlayerId('Markovnik', dayjsUTC('2022-11-04T18:00:00.000Z')),
          name: '[A]Markovnik',
          count: 3,
        }],
      }),
      generatePlayerInfo({
        id: 1,
        name: '[A]Markovnik',
        isDead: true,
        killers: [{
          id: getPlayerId('callisto1', dayjsUTC('2022-11-04T18:00:00.000Z')),
          name: '[A]callisto1',
          count: 1,
        }],
      }),
    ],
  },
  {
    date: '2023-04-14T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({
        id: 0,
        name: '[W8]Outkast',
        kills: 3,
        killed: [{
          id: getPlayerId('borigen', dayjsUTC('2023-04-14T18:00:00.000Z')),
          name: '[A]borigen',
          count: 3,
        }],
      }),
      generatePlayerInfo({
        id: 1,
        name: '[A]borigen',
        isDead: true,
        killers: [{
          id: getPlayerId('Outkast', dayjsUTC('2023-04-14T18:00:00.000Z')),
          name: '[A]Outkast',
          count: 1,
        }],
      }),
    ],
  },
  {
    date: '2023-09-01T18:00:00.000Z',
    missionName: '',
    result: [
      generatePlayerInfo({
        id: 0,
        name: '[W8]AllCash',
        kills: 3,
        killed: [{
          id: getPlayerId('borigen', dayjsUTC('2023-09-01T18:00:00.000Z')),
          name: '[A]borigen',
          count: 3,
        }],
      }),
      generatePlayerInfo({
        id: 1,
        name: '[A]borigen',
        isDead: true,
        killers: [{
          id: getPlayerId('AllCash', dayjsUTC('2023-09-01T18:00:00.000Z')),
          name: '[A]AllCash',
          count: 1,
        }],
      }),
    ],
  },
];
