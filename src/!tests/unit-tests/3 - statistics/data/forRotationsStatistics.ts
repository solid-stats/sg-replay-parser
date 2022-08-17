/* eslint-disable object-curly-newline */
import { Dayjs } from 'dayjs';

import { generateDefaultWeapons, generatePlayerInfo } from '../../1 - replays, 2 - parseReplayInfo/utils';

const getDate = (date: Dayjs, weeks: number, weekday: number, hour: number) => (
  date
    .add(weeks, 'w')
    .weekday(weekday)
    .hour(hour)
    .minute(0)
    .second(0)
    .millisecond(0)
    .toISOString()
);

export const getReplays = (startDate: Dayjs): PlayersGameResult[] => ([
  {
    date: getDate(startDate, 0, 4, 18),
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', kills: 2 }),
      generatePlayerInfo({ id: 1, name: '[FNX]Flashback' }),
      generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', kills: 3, teamkills: 1 }),
      generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy' }),
      generatePlayerInfo({ id: 7, name: '[FNX]Puma', kills: 3 }),
    ],
  },
  {
    date: getDate(startDate, 0, 4, 20),
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', kills: 1 }),
      generatePlayerInfo({ id: 1, name: '[FNX]Flashback', kills: 2 }),
      generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', teamkills: 1 }),
      generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', kills: 2 }),
      generatePlayerInfo({ id: 5, name: '[FNX]LOXDOR', kills: 1 }),
      generatePlayerInfo({ id: 6, name: '[FNX]T1m', kills: 1 }),
    ],
  },
  {
    date: getDate(startDate, 0, 5, 18),
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', teamkills: 1 }),
      generatePlayerInfo({ id: 1, name: '[FNX]Flashback', kills: 4, teamkills: 2 }),
      generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', kills: 6 }),
      generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', teamkills: 1 }),
      generatePlayerInfo({ id: 7, name: '[FNX]Puma' }),
    ],
  },
  {
    date: getDate(startDate, 0, 5, 20),
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r' }),
      generatePlayerInfo({ id: 1, name: '[FNX]Flashback', kills: 1 }),
      generatePlayerInfo({ id: 2, name: '[FNX]Skywalker' }),
      generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', kills: 3 }),
      generatePlayerInfo({ id: 7, name: '[FNX]Puma' }),
    ],
  },
  {
    date: getDate(startDate, 1, 4, 18),
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', kills: 2 }),
      generatePlayerInfo({ id: 1, name: '[FNX]Flashback' }),
      generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', kills: 3, teamkills: 1 }),
      generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy' }),
      generatePlayerInfo({ id: 7, name: '[FNX]Puma', kills: 3 }),
    ],
  },
  {
    date: getDate(startDate, 1, 4, 20),
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', kills: 1 }),
      generatePlayerInfo({ id: 1, name: '[FNX]Flashback', kills: 1 }),
      generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', teamkills: 1 }),
      generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', kills: 2 }),
      generatePlayerInfo({ id: 5, name: '[FNX]LOXDOR', kills: 1 }),
    ],
  },
  {
    date: getDate(startDate, 1, 5, 18),
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', teamkills: 1 }),
      generatePlayerInfo({ id: 1, name: '[FNX]Flashback', kills: 4, teamkills: 2 }),
      generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', kills: 6 }),
      generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', teamkills: 1 }),
      generatePlayerInfo({ id: 7, name: '[FNX]Puma' }),
    ],
  },
  {
    date: getDate(startDate, 1, 5, 20),
    missionName: '',
    result: [
      generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r' }),
      generatePlayerInfo({ id: 1, name: '[FNX]Flashback', kills: 1 }),
      generatePlayerInfo({ id: 2, name: '[FNX]Skywalker' }),
      generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', kills: 3 }),
      generatePlayerInfo({ id: 7, name: '[FNX]Puma' }),
    ],
  },
]);

export const globalStatistics = [
  {
    name: 'Skywalker',
    lastSquadPrefix: '[FNX]',
    totalPlayedGames: 8,
    kills: 18,
    vehicleKills: 0,
    teamkills: 4,
    deaths: { total: 0, byTeamkills: 0 },
    kdRatio: 14,
    totalScore: 1.75,
    byWeeks: [
      {
        totalPlayedGames: 4,
        kills: 9,
        vehicleKills: 0,
        teamkills: 2,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 7,
        score: 1.75,
      },
      {
        totalPlayedGames: 4,
        kills: 9,
        vehicleKills: 0,
        teamkills: 2,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 7,
        score: 1.75,
      },
    ],
    weapons: generateDefaultWeapons(18),
  },
  {
    name: 'Flashback',
    lastSquadPrefix: '[FNX]',
    totalPlayedGames: 8,
    kills: 13,
    vehicleKills: 0,
    teamkills: 4,
    deaths: { total: 0, byTeamkills: 0 },
    kdRatio: 9,
    totalScore: 1.13,
    byWeeks: [
      {
        totalPlayedGames: 4,
        kills: 6,
        vehicleKills: 0,
        teamkills: 2,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 4,
        score: 1,
      },
      {
        totalPlayedGames: 4,
        kills: 7,
        vehicleKills: 0,
        teamkills: 2,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 5,
        score: 1.25,
      },
    ],
    weapons: generateDefaultWeapons(13),
  },
  {
    name: 'Mecheniy',
    lastSquadPrefix: '[FNX]',
    totalPlayedGames: 8,
    kills: 10,
    vehicleKills: 0,
    teamkills: 2,
    deaths: { total: 0, byTeamkills: 0 },
    kdRatio: 8,
    totalScore: 1,
    byWeeks: [
      {
        totalPlayedGames: 4,
        kills: 5,
        vehicleKills: 0,
        teamkills: 1,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 4,
        score: 1,
      },
      {
        totalPlayedGames: 4,
        kills: 5,
        vehicleKills: 0,
        teamkills: 1,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 4,
        score: 1,
      },
    ],
    weapons: generateDefaultWeapons(10),
  },
  {
    name: 'Puma',
    lastSquadPrefix: '[FNX]',
    totalPlayedGames: 6,
    kills: 6,
    vehicleKills: 0,
    teamkills: 0,
    deaths: { total: 0, byTeamkills: 0 },
    kdRatio: 6,
    totalScore: 1,
    byWeeks: [
      {
        totalPlayedGames: 3,
        kills: 3,
        vehicleKills: 0,
        teamkills: 0,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 3,
        score: 1,
      },
      {
        totalPlayedGames: 3,
        kills: 3,
        vehicleKills: 0,
        teamkills: 0,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 3,
        score: 1,
      },
    ],
    weapons: generateDefaultWeapons(6),
  },
  {
    name: 'LOXDOR',
    lastSquadPrefix: '[FNX]',
    totalPlayedGames: 2,
    kills: 2,
    vehicleKills: 0,
    teamkills: 0,
    deaths: { total: 0, byTeamkills: 0 },
    kdRatio: 2,
    totalScore: 1,
    byWeeks: [
      {
        totalPlayedGames: 1,
        kills: 1,
        vehicleKills: 0,
        teamkills: 0,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 1,
        score: 1,
      },
      {
        totalPlayedGames: 1,
        kills: 1,
        vehicleKills: 0,
        teamkills: 0,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 1,
        score: 1,
      },
    ],
    weapons: generateDefaultWeapons(2),
  },
  {
    name: 'Afgan0r',
    lastSquadPrefix: '[FNX]',
    totalPlayedGames: 8,
    kills: 6,
    vehicleKills: 0,
    teamkills: 2,
    deaths: { total: 0, byTeamkills: 0 },
    kdRatio: 4,
    totalScore: 0.5,
    byWeeks: [
      {
        totalPlayedGames: 4,
        kills: 3,
        vehicleKills: 0,
        teamkills: 1,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 2,
        score: 0.5,
      },
      {
        totalPlayedGames: 4,
        kills: 3,
        vehicleKills: 0,
        teamkills: 1,
        deaths: { total: 0, byTeamkills: 0 },
        kdRatio: 2,
        score: 0.5,
      },
    ],
    weapons: generateDefaultWeapons(6),
  },
];

// players: 8 8 8 8 2 6 1 = 41
// kills: 6 13 18 10 2 6 1 = 56
// teamkills: 2 4 4 2 0 0 0 = 12

export const squadStatistics: GlobalSquadStatistics[] = [{
  prefix: '[FNX]',
  averagePlayersCount: 5.13,
  kills: 56,
  averageKills: 7,
  teamkills: 12,
  averageTeamkills: 0.21,
  score: 1.37,
  players: ['Skywalker', 'Flashback', 'Mecheniy', 'Puma', 'LOXDOR', 'Afgan0r'],
}];
