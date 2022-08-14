import { orderBy } from 'lodash';

import { generateDefaultWeapons, generatePlayerInfo } from '../../1 - replays, 2 - parseReplayInfo/utils';

type TestData = {
  playersGameResult: PlayersGameResult[];
  globalStatistics: GlobalPlayerStatistics[];
};

const data: TestData = {
  playersGameResult: [
    {
      date: '2022-08-05T18:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({
          id: 0, name: '[FNX]Afgan0r', side: 'EAST', kills: 2, isDead: true,
        }),
        generatePlayerInfo({
          id: 1, name: '[FNX]Skywalker', side: 'EAST', teamkills: 1,
        }),
        generatePlayerInfo({
          id: 2, name: '[FNX]Loxdor', side: 'EAST', kills: 4, vehicleKills: 1, isDead: true,
        }),
      ],
    },
    {
      date: '2022-08-05T20:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({
          id: 0, name: '[FNX]Afgan0r', side: 'EAST',
        }),
        generatePlayerInfo({
          id: 1, name: '[FNX]Loxdor', side: 'EAST', kills: 7, vehicleKills: 2,
        }),
      ],
    },
    {
      date: '2022-08-12T18:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({
          id: 0, name: '[FNX]Afgan0r', side: 'EAST', kills: 3, teamkills: 1, isDead: true,
        }),
        generatePlayerInfo({
          id: 1, name: '[FNX]Skywalker', side: 'EAST', kills: 1, isDead: true,
        }),
      ],
    },
    {
      date: '2022-08-12T20:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({
          id: 0, name: '[FNX]Afgan0r', side: 'EAST', isDead: true, isDeadByTeamkill: true,
        }),
        generatePlayerInfo({
          id: 1, name: '[FNX]Skywalker', side: 'EAST', teamkills: 2,
        }),
      ],
    },
  ],
  globalStatistics: orderBy([
    {
      name: 'Afgan0r',
      lastSquadPrefix: '[FNX]',
      totalPlayedGames: 4,
      kills: 5,
      vehicleKills: 0,
      teamkills: 1,
      deaths: { total: 3, byTeamkills: 1 },
      kdRatio: 2,
      totalScore: 1.33,
      lastPlayedGameDate: '2022-08-12T20:00:00.000Z',
      byWeeks: [
        {
          week: '2022-32',
          startDate: '2022-08-08T00:00:00.000Z',
          endDate: '2022-08-14T23:59:59.999Z',
          totalPlayedGames: 2,
          kills: 3,
          vehicleKills: 0,
          teamkills: 1,
          deaths: { total: 2, byTeamkills: 1 },
          kdRatio: 2,
          score: 2,
        },
        {
          week: '2022-31',
          startDate: '2022-08-01T00:00:00.000Z',
          endDate: '2022-08-07T23:59:59.999Z',
          totalPlayedGames: 2,
          kills: 2,
          vehicleKills: 0,
          teamkills: 0,
          deaths: { total: 1, byTeamkills: 0 },
          kdRatio: 2,
          score: 1,
        },
      ],
      weapons: generateDefaultWeapons(5),
    },
    {
      name: 'Skywalker',
      lastSquadPrefix: '[FNX]',
      totalPlayedGames: 3,
      kills: 1,
      vehicleKills: 0,
      teamkills: 3,
      deaths: { total: 1, byTeamkills: 0 },
      kdRatio: -2,
      totalScore: -0.67,
      lastPlayedGameDate: '2022-08-12T20:00:00.000Z',
      byWeeks: [
        {
          week: '2022-32',
          startDate: '2022-08-08T00:00:00.000Z',
          endDate: '2022-08-14T23:59:59.999Z',
          totalPlayedGames: 2,
          kills: 1,
          vehicleKills: 0,
          teamkills: 2,
          deaths: { total: 1, byTeamkills: 0 },
          kdRatio: -1,
          score: -0.5,
        },
        {
          week: '2022-31',
          startDate: '2022-08-01T00:00:00.000Z',
          endDate: '2022-08-07T23:59:59.999Z',
          totalPlayedGames: 1,
          kills: 0,
          vehicleKills: 0,
          teamkills: 1,
          deaths: { total: 0, byTeamkills: 0 },
          kdRatio: 0,
          score: -1,
        },
      ],
      weapons: generateDefaultWeapons(1),
    },
    {
      name: 'Loxdor',
      lastSquadPrefix: '[FNX]',
      totalPlayedGames: 2,
      kills: 11,
      vehicleKills: 3,
      teamkills: 0,
      deaths: { total: 1, byTeamkills: 0 },
      kdRatio: 11,
      totalScore: 5.5,
      lastPlayedGameDate: '2022-08-05T20:00:00.000Z',
      byWeeks: [
        {
          week: '2022-31',
          startDate: '2022-08-01T00:00:00.000Z',
          endDate: '2022-08-07T23:59:59.999Z',
          totalPlayedGames: 2,
          kills: 11,
          vehicleKills: 3,
          teamkills: 0,
          deaths: { total: 1, byTeamkills: 0 },
          kdRatio: 11,
          score: 5.5,
        },
      ],
      weapons: generateDefaultWeapons(11),
    },
  ], 'totalScore', 'desc'),
};

export default data;