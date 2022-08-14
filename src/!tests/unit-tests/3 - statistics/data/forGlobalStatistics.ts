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
      ],
    },
    {
      date: '2022-08-05T20:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({
          id: 0, name: '[FNX]Afgan0r', side: 'EAST',
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
      ],
    },
    {
      date: '2022-08-12T20:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({
          id: 0, name: '[FNX]Afgan0r', side: 'EAST', isDead: true, isDeadByTeamkill: true,
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
  ], 'totalScore', 'desc'),
};

export default data;
