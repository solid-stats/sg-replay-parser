/* eslint-disable max-len */
/* eslint-disable object-property-newline */
/* eslint-disable object-curly-newline */
import { generateDefaultWeapons, generatePlayerInfo } from '../../1 - replays, 2 - parseReplayInfo/utils';

type GlobalStatisticsData = {
  input: PlayersGameResult[];
  output: GlobalPlayerStatistics[];
};

const globalStatisticsTestData: GlobalStatisticsData = {
  input: [
    {
      date: '2022-07-22T18:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', side: 'EAST', kills: 2, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[FNX]Flashback', side: 'EAST', kills: 1, vehicleKills: 1, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', side: 'EAST', kills: 0, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[FNX]Puma', side: 'EAST', kills: 2, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', side: 'EAST', kills: 4, vehicleKills: 2, teamkills: 2, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 5, name: '[FNX]LONDOR', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[FNX]Brom', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[FNX]T1m', side: 'EAST', kills: 4, vehicleKills: 1, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 0, name: '[Creep]Frexis', side: 'GUER', kills: 4, vehicleKills: 0, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[Creep]Axus', side: 'GUER', kills: 2, vehicleKills: 1, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[Creep]HIZL', side: 'GUER', kills: 2, vehicleKills: 0, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[Creep]Tundra', side: 'GUER', kills: 2, vehicleKills: 1, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[Creep]BepTyxau', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 5, name: '[Creep]Srochnik', side: 'GUER', kills: 0, vehicleKills: 0, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[Creep]Savchikkk', side: 'GUER', kills: 3, vehicleKills: 2, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[Creep]Karibo', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 8, name: '[Creep]nyM6a', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 9, name: '[CU]HaskiLove', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 10, name: '[CU]Nucis', side: 'GUER', kills: 1, vehicleKills: 1, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 11, name: '[CU]Grow', side: 'GUER', kills: 4, vehicleKills: 1, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 12, name: '[CU]Savel', side: 'GUER', kills: 1, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 13, name: '[CU]Koshmar', side: 'GUER', kills: 1, vehicleKills: 0, teamkills: 1, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 14, name: '[CU]Eeshka', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
      ],
    },
    {
      date: '2022-07-22T20:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', side: 'EAST', kills: 4, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[FNX]Flashback', side: 'EAST', kills: 0, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[FNX]Puma', side: 'EAST', kills: 2, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', side: 'EAST', kills: 4, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 5, name: '[FNX]LONDOR', side: 'EAST', kills: 2, vehicleKills: 1, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[FNX]Brom', side: 'EAST', kills: 3, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[FNX]T1m', side: 'EAST', kills: 3, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 0, name: '[Creep]Frexis', side: 'GUER', kills: 2, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 1, name: '[Creep]Axus', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[Creep]HIZL', side: 'GUER', kills: 0, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 3, name: '[Creep]Tundra', side: 'GUER', kills: 4, vehicleKills: 1, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[Creep]BepTyxau', side: 'GUER', kills: 1, vehicleKills: 0, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 5, name: '[Creep]Srochnik', side: 'GUER', kills: 3, vehicleKills: 2, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[Creep]Savchikkk', side: 'GUER', kills: 0, vehicleKills: 1, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[Creep]Karibo', side: 'GUER', kills: 1, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 8, name: '[Creep]nyM6a', side: 'GUER', kills: 1, vehicleKills: 2, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 9, name: '[CU]HaskiLove', side: 'GUER', kills: 1, vehicleKills: 1, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 10, name: '[CU]Nucis', side: 'GUER', kills: 0, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 11, name: '[CU]Grow', side: 'GUER', kills: 2, vehicleKills: 2, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 12, name: '[CU]Savel', side: 'GUER', kills: 4, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 13, name: '[CU]Koshmar', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 14, name: '[CU]Eeshka', side: 'GUER', kills: 2, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: true }),
      ],
    },
    {
      date: '2022-07-23T18:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[FNX]Flashback', side: 'EAST', kills: 0, vehicleKills: 0, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', side: 'EAST', kills: 3, vehicleKills: 0, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[FNX]Puma', side: 'EAST', kills: 4, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', side: 'EAST', kills: 4, vehicleKills: 1, teamkills: 2, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 5, name: '[FNX]LONDOR', side: 'EAST', kills: 0, vehicleKills: 0, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[FNX]Brom', side: 'EAST', kills: 4, vehicleKills: 2, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[FNX]T1m', side: 'EAST', kills: 0, vehicleKills: 0, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 0, name: '[Creep]Frexis', side: 'GUER', kills: 1, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[Creep]Axus', side: 'GUER', kills: 1, vehicleKills: 2, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[Creep]HIZL', side: 'GUER', kills: 0, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 3, name: '[Creep]Tundra', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[Creep]BepTyxau', side: 'GUER', kills: 4, vehicleKills: 1, teamkills: 2, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 5, name: '[Creep]Srochnik', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 2, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 6, name: '[Creep]Savchikkk', side: 'GUER', kills: 2, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[Creep]Karibo', side: 'GUER', kills: 0, vehicleKills: 0, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 8, name: '[Creep]nyM6a', side: 'GUER', kills: 2, vehicleKills: 0, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 9, name: '[CU]HaskiLove', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 10, name: '[CU]Nucis', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 11, name: '[CU]Grow', side: 'GUER', kills: 1, vehicleKills: 0, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 12, name: '[CU]Savel', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 13, name: '[CU]Koshmar', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 14, name: '[CU]Eeshka', side: 'GUER', kills: 1, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
      ],
    },
    {
      date: '2022-07-23T20:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', side: 'EAST', kills: 4, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[FNX]Flashback', side: 'EAST', kills: 3, vehicleKills: 0, teamkills: 1, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', side: 'EAST', kills: 0, vehicleKills: 0, teamkills: 1, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 3, name: '[FNX]Puma', side: 'EAST', kills: 0, vehicleKills: 1, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', side: 'EAST', kills: 2, vehicleKills: 0, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 5, name: '[FNX]LONDOR', side: 'EAST', kills: 0, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[FNX]Brom', side: 'EAST', kills: 1, vehicleKills: 1, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[FNX]T1m', side: 'EAST', kills: 0, vehicleKills: 1, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 0, name: '[Creep]Frexis', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[Creep]Axus', side: 'GUER', kills: 2, vehicleKills: 2, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[Creep]HIZL', side: 'GUER', kills: 4, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[Creep]Tundra', side: 'GUER', kills: 2, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[Creep]BepTyxau', side: 'GUER', kills: 2, vehicleKills: 1, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 5, name: '[Creep]Srochnik', side: 'GUER', kills: 1, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[Creep]Savchikkk', side: 'GUER', kills: 1, vehicleKills: 1, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[Creep]Karibo', side: 'GUER', kills: 0, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 8, name: '[Creep]nyM6a', side: 'GUER', kills: 0, vehicleKills: 1, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 9, name: '[CU]HaskiLove', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 10, name: '[CU]Nucis', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 11, name: '[CU]Grow', side: 'GUER', kills: 2, vehicleKills: 1, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 12, name: '[CU]Savel', side: 'GUER', kills: 3, vehicleKills: 1, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 13, name: '[CU]Koshmar', side: 'GUER', kills: 1, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 14, name: '[CU]Eeshka', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
      ],
    },
    {
      date: '2022-07-29T18:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', side: 'EAST', kills: 1, vehicleKills: 0, teamkills: 1, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 1, name: '[FNX]Flashback', side: 'EAST', kills: 4, vehicleKills: 0, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', side: 'EAST', kills: 3, vehicleKills: 1, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[FNX]Puma', side: 'EAST', kills: 1, vehicleKills: 1, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', side: 'EAST', kills: 2, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 5, name: '[FNX]LONDOR', side: 'EAST', kills: 4, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[FNX]Brom', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[FNX]T1m', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 0, name: '[Creep]Frexis', side: 'GUER', kills: 4, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[Creep]Axus', side: 'GUER', kills: 1, vehicleKills: 0, teamkills: 2, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 2, name: '[Creep]HIZL', side: 'GUER', kills: 2, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 3, name: '[Creep]Tundra', side: 'GUER', kills: 0, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[Creep]BepTyxau', side: 'GUER', kills: 2, vehicleKills: 2, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 5, name: '[Creep]Srochnik', side: 'GUER', kills: 3, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[Creep]Savchikkk', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[Creep]Karibo', side: 'GUER', kills: 3, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 8, name: '[Creep]nyM6a', side: 'GUER', kills: 2, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 9, name: '[CU]HaskiLove', side: 'GUER', kills: 3, vehicleKills: 2, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 10, name: '[CU]Nucis', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 11, name: '[CU]Grow', side: 'GUER', kills: 1, vehicleKills: 2, teamkills: 1, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 12, name: '[CU]Savel', side: 'GUER', kills: 1, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 13, name: '[CU]Koshmar', side: 'GUER', kills: 0, vehicleKills: 1, teamkills: 0, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 14, name: '[CU]Eeshka', side: 'GUER', kills: 1, vehicleKills: 0, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
      ],
    },
    {
      date: '2022-07-29T20:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', side: 'EAST', kills: 3, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[FNX]Flashback', side: 'EAST', kills: 4, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', side: 'EAST', kills: 2, vehicleKills: 1, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[FNX]Puma', side: 'EAST', kills: 2, vehicleKills: 1, teamkills: 0, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', side: 'EAST', kills: 1, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 5, name: '[FNX]LONDOR', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[FNX]Brom', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[FNX]T1m', side: 'EAST', kills: 2, vehicleKills: 0, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 0, name: '[Creep]Frexis', side: 'GUER', kills: 3, vehicleKills: 1, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[Creep]Axus', side: 'GUER', kills: 1, vehicleKills: 0, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[Creep]HIZL', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[Creep]Tundra', side: 'GUER', kills: 3, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[Creep]BepTyxau', side: 'GUER', kills: 2, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 5, name: '[Creep]Srochnik', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[Creep]Savchikkk', side: 'GUER', kills: 0, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[Creep]Karibo', side: 'GUER', kills: 4, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 8, name: '[Creep]nyM6a', side: 'GUER', kills: 1, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 9, name: '[CU]HaskiLove', side: 'GUER', kills: 2, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 10, name: '[CU]Nucis', side: 'GUER', kills: 2, vehicleKills: 2, teamkills: 2, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 11, name: '[CU]Grow', side: 'GUER', kills: 0, vehicleKills: 1, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 12, name: '[CU]Savel', side: 'GUER', kills: 0, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 13, name: '[CU]Koshmar', side: 'GUER', kills: 0, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 14, name: '[CU]Eeshka', side: 'GUER', kills: 0, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
      ],
    },
    {
      date: '2022-07-30T18:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', side: 'EAST', kills: 4, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[FNX]Flashback', side: 'EAST', kills: 3, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[FNX]Puma', side: 'EAST', kills: 4, vehicleKills: 2, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', side: 'EAST', kills: 3, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 5, name: '[FNX]LONDOR', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[FNX]Brom', side: 'EAST', kills: 4, vehicleKills: 0, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[FNX]T1m', side: 'EAST', kills: 2, vehicleKills: 2, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 0, name: '[Creep]Frexis', side: 'GUER', kills: 2, vehicleKills: 0, teamkills: 1, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 1, name: '[Creep]Axus', side: 'GUER', kills: 0, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[Creep]HIZL', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[Creep]Tundra', side: 'GUER', kills: 2, vehicleKills: 1, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[Creep]BepTyxau', side: 'GUER', kills: 3, vehicleKills: 1, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 5, name: '[Creep]Srochnik', side: 'GUER', kills: 1, vehicleKills: 1, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[Creep]Savchikkk', side: 'GUER', kills: 1, vehicleKills: 0, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[Creep]Karibo', side: 'GUER', kills: 3, vehicleKills: 2, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 8, name: '[Creep]nyM6a', side: 'GUER', kills: 1, vehicleKills: 2, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 9, name: '[CU]HaskiLove', side: 'GUER', kills: 1, vehicleKills: 1, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 10, name: '[CU]Nucis', side: 'GUER', kills: 1, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 11, name: '[CU]Grow', side: 'GUER', kills: 4, vehicleKills: 1, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 12, name: '[CU]Savel', side: 'GUER', kills: 3, vehicleKills: 1, teamkills: 2, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 13, name: '[CU]Koshmar', side: 'GUER', kills: 3, vehicleKills: 2, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 14, name: '[CU]Eeshka', side: 'GUER', kills: 4, vehicleKills: 1, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
      ],
    },
    {
      date: '2022-07-30T20:00:00.000Z',
      missionName: '',
      result: [
        generatePlayerInfo({ id: 0, name: '[FNX]Afgan0r', side: 'EAST', kills: 3, vehicleKills: 0, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[FNX]Flashback', side: 'EAST', kills: 3, vehicleKills: 2, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[FNX]Skywalker', side: 'EAST', kills: 1, vehicleKills: 2, teamkills: 0, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[FNX]Puma', side: 'EAST', kills: 3, vehicleKills: 1, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[FNX]Mecheniy', side: 'EAST', kills: 1, vehicleKills: 0, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 5, name: '[FNX]LONDOR', side: 'EAST', kills: 1, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[FNX]Brom', side: 'EAST', kills: 4, vehicleKills: 1, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[FNX]T1m', side: 'EAST', kills: 3, vehicleKills: 1, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 0, name: '[Creep]Frexis', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 1, name: '[Creep]Axus', side: 'GUER', kills: 0, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 2, name: '[Creep]HIZL', side: 'GUER', kills: 0, vehicleKills: 0, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 3, name: '[Creep]Tundra', side: 'GUER', kills: 4, vehicleKills: 1, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 4, name: '[Creep]BepTyxau', side: 'GUER', kills: 2, vehicleKills: 0, teamkills: 2, isDead: true, isDeadByTeamkill: true }),
        generatePlayerInfo({ id: 5, name: '[Creep]Srochnik', side: 'GUER', kills: 2, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 6, name: '[Creep]Savchikkk', side: 'GUER', kills: 2, vehicleKills: 1, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 7, name: '[Creep]Karibo', side: 'GUER', kills: 0, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 8, name: '[Creep]nyM6a', side: 'GUER', kills: 0, vehicleKills: 2, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 9, name: '[CU]HaskiLove', side: 'GUER', kills: 4, vehicleKills: 2, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 10, name: '[CU]Nucis', side: 'GUER', kills: 3, vehicleKills: 1, teamkills: 1, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 11, name: '[CU]Grow', side: 'GUER', kills: 2, vehicleKills: 0, teamkills: 0, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 12, name: '[CU]Savel', side: 'GUER', kills: 0, vehicleKills: 0, teamkills: 1, isDead: true, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 13, name: '[CU]Koshmar', side: 'GUER', kills: 0, vehicleKills: 1, teamkills: 2, isDead: false, isDeadByTeamkill: false }),
        generatePlayerInfo({ id: 14, name: '[CU]Eeshka', side: 'GUER', kills: 3, vehicleKills: 0, teamkills: 2, isDead: true, isDeadByTeamkill: false }),
      ],
    },
  ],
  output: [
    {
      name: 'Afgan0r', lastSquadPrefix: '[FNX]', totalPlayedGames: 8, kills: 22, teamkills: 5, vehicleKills: 8, deaths: { total: 5, byTeamkills: 1 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 4.25, totalScore: 2.43, weapons: generateDefaultWeapons(22),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 11, vehicleKills: 2, teamkills: 3, deaths: { total: 3, byTeamkills: 1 }, kdRatio: 4, score: 2.67,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 11, vehicleKills: 6, teamkills: 2, deaths: { total: 2, byTeamkills: 0 }, kdRatio: 4.5, score: 2.25,
        },
      ],
    },
    {
      name: 'Mecheniy', lastSquadPrefix: '[FNX]', totalPlayedGames: 8, kills: 21, teamkills: 9, vehicleKills: 5, deaths: { total: 8, byTeamkills: 3 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 2.4, totalScore: 2.4, weapons: generateDefaultWeapons(21),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 7, vehicleKills: 1, teamkills: 2, deaths: { total: 4, byTeamkills: 1 }, kdRatio: 1.67, score: 1.67,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 14, vehicleKills: 4, teamkills: 7, deaths: { total: 4, byTeamkills: 2 }, kdRatio: 3.5, score: 3.5,
        },
      ],
    },
    {
      name: 'Puma', lastSquadPrefix: '[FNX]', totalPlayedGames: 8, kills: 18, teamkills: 2, vehicleKills: 12, deaths: { total: 5, byTeamkills: 1 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 4, totalScore: 2.29, weapons: generateDefaultWeapons(18),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 10, vehicleKills: 5, teamkills: 2, deaths: { total: 3, byTeamkills: 1 }, kdRatio: 4, score: 2.67,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 8, vehicleKills: 7, teamkills: 0, deaths: { total: 2, byTeamkills: 0 }, kdRatio: 4, score: 2,
        },
      ],
    },
    {
      name: 'Tundra', lastSquadPrefix: '[Creep]', totalPlayedGames: 8, kills: 21, teamkills: 3, vehicleKills: 9, deaths: { total: 4, byTeamkills: 0 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 4.5, totalScore: 2.25, weapons: generateDefaultWeapons(21),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 9, vehicleKills: 5, teamkills: 2, deaths: { total: 3, byTeamkills: 0 }, kdRatio: 2.33, score: 1.75,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 12, vehicleKills: 4, teamkills: 1, deaths: { total: 1, byTeamkills: 0 }, kdRatio: 11, score: 2.75,
        },
      ],
    },
    {
      name: 'HIZL', lastSquadPrefix: '[Creep]', totalPlayedGames: 8, kills: 15, teamkills: 5, vehicleKills: 4, deaths: { total: 4, byTeamkills: 3 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 10, totalScore: 2, weapons: generateDefaultWeapons(15),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 9, vehicleKills: 2, teamkills: 1, deaths: { total: 2, byTeamkills: 1 }, kdRatio: 8, score: 2.67,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 6, vehicleKills: 2, teamkills: 4, deaths: { total: 2, byTeamkills: 2 }, kdRatio: 6, score: 1,
        },
      ],
    },
    {
      name: 'BepTyxau', lastSquadPrefix: '[Creep]', totalPlayedGames: 8, kills: 20, teamkills: 11, vehicleKills: 7, deaths: { total: 5, byTeamkills: 3 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 4.5, totalScore: 1.8, weapons: generateDefaultWeapons(20),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 9, vehicleKills: 3, teamkills: 7, deaths: { total: 3, byTeamkills: 1 }, kdRatio: 1, score: 0.67,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 11, vehicleKills: 4, teamkills: 4, deaths: { total: 2, byTeamkills: 2 }, kdRatio: 11, score: 3.5,
        },
      ],
    },
    {
      name: 'Frexis', lastSquadPrefix: '[Creep]', totalPlayedGames: 8, kills: 23, teamkills: 13, vehicleKills: 3, deaths: { total: 5, byTeamkills: 2 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 3.33, totalScore: 1.67, weapons: generateDefaultWeapons(23),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 12, vehicleKills: 1, teamkills: 7, deaths: { total: 2, byTeamkills: 1 }, kdRatio: 5, score: 1.67,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 11, vehicleKills: 2, teamkills: 6, deaths: { total: 3, byTeamkills: 1 }, kdRatio: 2.5, score: 1.67,
        },
      ],
    },
    {
      name: 'Savel', lastSquadPrefix: '[CU]', totalPlayedGames: 8, kills: 15, teamkills: 7, vehicleKills: 6, deaths: { total: 7, byTeamkills: 3 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 2, totalScore: 1.6, weapons: generateDefaultWeapons(15),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 4, vehicleKills: 4, teamkills: 6, deaths: { total: 3, byTeamkills: 2 }, kdRatio: -2, score: -1,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 11, vehicleKills: 2, teamkills: 1, deaths: { total: 4, byTeamkills: 1 }, kdRatio: 3.33, score: 3.33,
        },
      ],
    },
    {
      name: 'HaskiLove', lastSquadPrefix: '[CU]', totalPlayedGames: 8, kills: 22, teamkills: 11, vehicleKills: 11, deaths: { total: 5, byTeamkills: 1 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 2.75, totalScore: 1.57, weapons: generateDefaultWeapons(22),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 10, vehicleKills: 6, teamkills: 5, deaths: { total: 3, byTeamkills: 1 }, kdRatio: 2.5, score: 1.67,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 12, vehicleKills: 5, teamkills: 6, deaths: { total: 2, byTeamkills: 0 }, kdRatio: 3, score: 1.5,
        },
      ],
    },
    {
      name: 'T1m', lastSquadPrefix: '[FNX]', totalPlayedGames: 8, kills: 15, teamkills: 3, vehicleKills: 7, deaths: { total: 2, byTeamkills: 0 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 6, totalScore: 1.5, weapons: generateDefaultWeapons(15),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 8, vehicleKills: 5, teamkills: 3, deaths: { total: 1, byTeamkills: 0 }, kdRatio: 5, score: 1.25,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 7, vehicleKills: 2, teamkills: 0, deaths: { total: 1, byTeamkills: 0 }, kdRatio: 7, score: 1.75,
        },
      ],
    },
    {
      name: 'Flashback', lastSquadPrefix: '[FNX]', totalPlayedGames: 8, kills: 18, teamkills: 8, vehicleKills: 7, deaths: { total: 3, byTeamkills: 1 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 5, totalScore: 1.43, weapons: generateDefaultWeapons(18),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 14, vehicleKills: 4, teamkills: 5, deaths: { total: 1, byTeamkills: 0 }, kdRatio: 9, score: 2.25,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 4, vehicleKills: 3, teamkills: 3, deaths: { total: 2, byTeamkills: 1 }, kdRatio: 1, score: 0.33,
        },
      ],
    },
    {
      name: 'Srochnik', lastSquadPrefix: '[Creep]', totalPlayedGames: 8, kills: 17, teamkills: 7, vehicleKills: 9, deaths: { total: 5, byTeamkills: 1 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 2.5, totalScore: 1.43, weapons: generateDefaultWeapons(17),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 9, vehicleKills: 3, teamkills: 4, deaths: { total: 3, byTeamkills: 0 }, kdRatio: 1.67, score: 1.25,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 8, vehicleKills: 6, teamkills: 3, deaths: { total: 2, byTeamkills: 1 }, kdRatio: 5, score: 1.67,
        },
      ],
    },
    {
      name: 'Nucis', lastSquadPrefix: '[CU]', totalPlayedGames: 8, kills: 18, teamkills: 11, vehicleKills: 10, deaths: { total: 2, byTeamkills: 2 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 18, totalScore: 1.17, weapons: generateDefaultWeapons(18),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 9, vehicleKills: 5, teamkills: 7, deaths: { total: 1, byTeamkills: 1 }, kdRatio: 9, score: 0.67,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 9, vehicleKills: 5, teamkills: 4, deaths: { total: 1, byTeamkills: 1 }, kdRatio: 9, score: 1.67,
        },
      ],
    },
    {
      name: 'Eeshka', lastSquadPrefix: '[CU]', totalPlayedGames: 8, kills: 17, teamkills: 9, vehicleKills: 5, deaths: { total: 5, byTeamkills: 1 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 2, totalScore: 1.14, weapons: generateDefaultWeapons(17),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 8, vehicleKills: 1, teamkills: 7, deaths: { total: 2, byTeamkills: 0 }, kdRatio: 0.5, score: 0.25,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 9, vehicleKills: 4, teamkills: 2, deaths: { total: 3, byTeamkills: 1 }, kdRatio: 3.5, score: 2.33,
        },
      ],
    },
    {
      name: 'Brom', lastSquadPrefix: '[FNX]', totalPlayedGames: 8, kills: 19, teamkills: 10, vehicleKills: 11, deaths: { total: 4, byTeamkills: 0 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 2.25, totalScore: 1.13, weapons: generateDefaultWeapons(19),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 10, vehicleKills: 5, teamkills: 5, deaths: { total: 2, byTeamkills: 0 }, kdRatio: 2.5, score: 1.25,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 9, vehicleKills: 6, teamkills: 5, deaths: { total: 2, byTeamkills: 0 }, kdRatio: 2, score: 1,
        },
      ],
    },
    {
      name: 'Grow', lastSquadPrefix: '[CU]', totalPlayedGames: 8, kills: 16, teamkills: 9, vehicleKills: 8, deaths: { total: 3, byTeamkills: 1 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 3.5, totalScore: 1, weapons: generateDefaultWeapons(16),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 7, vehicleKills: 4, teamkills: 3, deaths: { total: 2, byTeamkills: 1 }, kdRatio: 4, score: 1.33,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 9, vehicleKills: 4, teamkills: 6, deaths: { total: 1, byTeamkills: 0 }, kdRatio: 3, score: 0.75,
        },
      ],
    },
    {
      name: 'Savchikkk', lastSquadPrefix: '[Creep]', totalPlayedGames: 8, kills: 12, teamkills: 7, vehicleKills: 9, deaths: { total: 2, byTeamkills: 0 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 2.5, totalScore: 0.63, weapons: generateDefaultWeapons(12),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 6, vehicleKills: 3, teamkills: 3, deaths: { total: 0, byTeamkills: 0 }, kdRatio: 6, score: 0.75,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 6, vehicleKills: 6, teamkills: 4, deaths: { total: 2, byTeamkills: 0 }, kdRatio: 1, score: 0.5,
        },
      ],
    },
    {
      name: 'Skywalker', lastSquadPrefix: '[FNX]', totalPlayedGames: 8, kills: 11, teamkills: 7, vehicleKills: 8, deaths: { total: 3, byTeamkills: 1 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 2, totalScore: 0.57, weapons: generateDefaultWeapons(11),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 7, vehicleKills: 6, teamkills: 4, deaths: { total: 1, byTeamkills: 0 }, kdRatio: 3, score: 0.75,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 4, vehicleKills: 2, teamkills: 3, deaths: { total: 2, byTeamkills: 1 }, kdRatio: 1, score: 0.33,
        },
      ],
    },
    {
      name: 'Karibo', lastSquadPrefix: '[Creep]', totalPlayedGames: 8, kills: 14, teamkills: 10, vehicleKills: 3, deaths: { total: 4, byTeamkills: 0 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 1, totalScore: 0.5, weapons: generateDefaultWeapons(14),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 10, vehicleKills: 3, teamkills: 5, deaths: { total: 3, byTeamkills: 0 }, kdRatio: 1.67, score: 1.25,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 4, vehicleKills: 0, teamkills: 5, deaths: { total: 1, byTeamkills: 0 }, kdRatio: -1, score: -0.25,
        },
      ],
    },
    {
      name: 'LONDOR', lastSquadPrefix: '[FNX]', totalPlayedGames: 8, kills: 10, teamkills: 7, vehicleKills: 8, deaths: { total: 2, byTeamkills: 0 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 1.5, totalScore: 0.38, weapons: generateDefaultWeapons(10),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 7, vehicleKills: 5, teamkills: 5, deaths: { total: 2, byTeamkills: 0 }, kdRatio: 1, score: 0.5,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 3, vehicleKills: 3, teamkills: 2, deaths: { total: 0, byTeamkills: 0 }, kdRatio: 3, score: 0.25,
        },
      ],
    },
    {
      name: 'Koshmar', lastSquadPrefix: '[CU]', totalPlayedGames: 8, kills: 13, teamkills: 12, vehicleKills: 10, deaths: { total: 3, byTeamkills: 2 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 1, totalScore: 0.17, weapons: generateDefaultWeapons(13),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 3, vehicleKills: 4, teamkills: 5, deaths: { total: 2, byTeamkills: 1 }, kdRatio: -2, score: -0.67,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 10, vehicleKills: 6, teamkills: 7, deaths: { total: 1, byTeamkills: 1 }, kdRatio: 10, score: 1,
        },
      ],
    },
    {
      name: 'nyM6a', lastSquadPrefix: '[Creep]', totalPlayedGames: 8, kills: 11, teamkills: 10, vehicleKills: 12, deaths: { total: 5, byTeamkills: 0 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: 0.2, totalScore: 0.13, weapons: generateDefaultWeapons(11),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 4, vehicleKills: 7, teamkills: 6, deaths: { total: 2, byTeamkills: 0 }, kdRatio: -1, score: -0.5,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 7, vehicleKills: 5, teamkills: 4, deaths: { total: 3, byTeamkills: 0 }, kdRatio: 1, score: 0.75,
        },
      ],
    },
    {
      name: 'Axus', lastSquadPrefix: '[Creep]', totalPlayedGames: 8, kills: 10, teamkills: 11, vehicleKills: 8, deaths: { total: 6, byTeamkills: 1 },
      lastPlayedGameDate: '2022-07-30T20:00:00.000Z', kdRatio: -0.2, totalScore: -0.14, weapons: generateDefaultWeapons(10),
      byWeeks: [
        {
          week: '2022-30', startDate: '2022-07-25T00:00:00.000Z', endDate: '2022-07-31T23:59:59.999Z',
          totalPlayedGames: 4, kills: 2, vehicleKills: 3, teamkills: 6, deaths: { total: 3, byTeamkills: 1 }, kdRatio: -2, score: -1.33,
        },
        {
          week: '2022-29', startDate: '2022-07-18T00:00:00.000Z', endDate: '2022-07-24T23:59:59.999Z',
          totalPlayedGames: 4, kills: 8, vehicleKills: 5, teamkills: 5, deaths: { total: 3, byTeamkills: 0 }, kdRatio: 1, score: 0.75,
        },
      ],
    },
  ],
};

export default globalStatisticsTestData;
