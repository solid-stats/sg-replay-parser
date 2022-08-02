/* eslint-disable no-console */
/* eslint-disable array-element-newline */

import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import random from 'lodash/random';

import calculateKDRatio from './calculateKDRatio';
import calculateScore from './calculateScore';
import { dayjsUTC } from './dayjs';
import getPlayerName from './getPlayerName';

// this code runs separately from the app to generate input for global statistics test data

// the number must be a multiple of 4
const replaysCount = 8;
const firstGameDate = '2022-07-18';
let lastDate = '';

const getKills = () => random(4);
const getVehicleKills = () => random(2);
const getTeamkills = () => random(2);
const getIsDead = () => random(1) === 1;
const getIsDeadByTeamkill = (isDead: boolean) => (isDead ? random(10) <= 2 : false);

const playersEast = [
  '[FNX]Afgan0r', '[FNX]Flashback', '[FNX]Skywalker', '[FNX]Puma', '[FNX]Mecheniy', '[FNX]LONDOR', '[FNX]Brom', '[FNX]T1m',
];
const playersGuer = [
  '[Creep]Frexis', '[Creep]Axus', '[Creep]HIZL', '[Creep]Tundra', '[Creep]BepTyxau', '[Creep]Srochnik', '[Creep]Savchikkk', '[Creep]Karibo', '[Creep]nyM6a',
  '[CU]HaskiLove', '[CU]Nucis', '[CU]Grow', '[CU]Savel', '[CU]Koshmar', '[CU]Eeshka',
];

type DefaultOutput = {
  totalPlayedGames: number;
  kills: Kills;
  vehicleKills: Kills;
  teamkills: Teamkills;
  deaths: Deaths;
  kdRatio: Score;
  score: Score
};
type PlayerOutput = DefaultOutput & {
  name: string;
  byWeeks: Array<DefaultOutput & {
    week: WeekNumber;
    startDate: string;
    endDate: string;
  }>;
};
type Output = Record<PlayerName, PlayerOutput>;
const output: Output = {};

const generateConsoleLog = (player: string, gameIndex: number, date: string, id: number, side: 'EAST' | 'GUER') => {
  const kills = getKills();
  const vehicleKills = getVehicleKills();
  const teamkills = getTeamkills();
  const isDead = getIsDead();
  const isDeadByTeamkill = getIsDeadByTeamkill(isDead);

  const playerInfo = output[player] || {
    totalPlayedGames: replaysCount,
    kills: 0,
    vehicleKills: 0,
    teamkills: 0,
    deaths: { total: 0, byTeamkills: 0 },
    kdRatio: 0,
    score: 0,
    byWeeks: [],
  };

  const weekIndex = Math.floor(gameIndex / 4);

  const weeks = cloneDeep(playerInfo.byWeeks);
  const weekInfo = weeks[weekIndex] || {
    totalPlayedGames: 4,
    kills: 0,
    teamkills: 0,
    vehicleKills: 0,
    deaths: { total: 0, byTeamkills: 0 },
  };

  const weekKills = weekInfo.kills + kills;
  const weekTeamkills = weekInfo.teamkills + teamkills;
  const weekVehicleKills = weekInfo.vehicleKills + vehicleKills;
  const weekDeaths = {
    total: isDead ? weekInfo.deaths.total + 1 : weekInfo.deaths.total,
    byTeamkills: isDeadByTeamkill
      ? weekInfo.deaths.byTeamkills + 1
      : weekInfo.deaths.byTeamkills,
  };
  const utcDate = dayjsUTC(date);
  const week = weekInfo.week || utcDate.format('YYYY-WW') as WeekNumber;
  const startDate = weekInfo.startDate || utcDate.startOf('isoWeek').toJSON();
  const endDate = weekInfo.endDate || utcDate.endOf('isoWeek').toJSON();

  weeks[weekIndex] = {
    week,
    startDate,
    endDate,
    totalPlayedGames: 4,
    kills: weekKills,
    teamkills: weekTeamkills,
    vehicleKills: weekVehicleKills,
    deaths: weekDeaths,
    kdRatio: calculateKDRatio(weekKills, weekTeamkills, weekDeaths),
    score: calculateScore(4, weekKills, weekTeamkills, weekDeaths),
  };

  const globalKills = playerInfo.kills + kills;
  const globalTeamkills = playerInfo.teamkills + teamkills;
  const globalVehicleKills = playerInfo.vehicleKills + vehicleKills;
  const globalDeaths = {
    total: isDead ? playerInfo.deaths.total + 1 : playerInfo.deaths.total,
    byTeamkills: isDeadByTeamkill
      ? playerInfo.deaths.byTeamkills + 1
      : playerInfo.deaths.byTeamkills,
  };

  output[player] = {
    name: player,
    totalPlayedGames: replaysCount,
    kills: globalKills,
    vehicleKills: globalVehicleKills,
    teamkills: globalTeamkills,
    deaths: globalDeaths,
    kdRatio: calculateKDRatio(globalKills, globalTeamkills, globalDeaths),
    score: calculateScore(replaysCount, globalKills, globalTeamkills, globalDeaths),
    byWeeks: weeks,
  };

  console.log(`generatePlayerInfo({ id: ${id}, name: '${player}', side: '${side}', kills: ${kills}, vehicleKills: ${vehicleKills}, teamkills: ${teamkills}, isDead: ${isDead}, isDeadByTeamkill: ${isDeadByTeamkill} }),`);
};

const generateDays = () => {
  let date = dayjsUTC(firstGameDate).day(5).hour(18);

  const days: string[] = [date.toJSON()];

  for (let index = 1; index < replaysCount; index += 1) {
    const isNextDay = index % 2 === 0;
    const isNextWeek = index % 4 === 0;

    if (isNextDay && !isNextWeek) date = date.add(1, 'd').subtract(2, 'h');

    if (isNextWeek) date = date.add(1, 'w').subtract(1, 'd').subtract(2, 'h');

    if (!(isNextDay || isNextWeek)) date = date.add(2, 'h');

    days.push(date.toJSON());
  }

  lastDate = days[days.length - 1];

  return days;
};

(() => {
  const dates = generateDays();

  console.log('input: [');

  for (let index = 0; index < replaysCount; index += 1) {
    const date = dates[index];

    console.log('{');
    console.log(`date: '${date}',`);
    console.log("missionName: '',");
    console.log('result: [');
    playersEast.forEach((player, id) => generateConsoleLog(player, index, date, id, 'EAST'));
    playersGuer.forEach((player, id) => generateConsoleLog(player, index, date, id, 'GUER'));
    console.log('],');
    console.log('},');
  }

  console.log('],');
  console.log('output: [');

  const players = orderBy(output, 'score', 'desc').map((player) => player.name);

  players.forEach((player) => {
    console.log('{');
    const {
      totalPlayedGames, kills, teamkills, vehicleKills, deaths, byWeeks, kdRatio, score,
    } = output[player];

    const playerName = getPlayerName(player);

    console.log(`name: '${playerName[0]}', lastSquadPrefix: '${playerName[1]}', totalPlayedGames: ${totalPlayedGames}, kills: ${kills}, teamkills: ${teamkills}, vehicleKills: ${vehicleKills}, deaths: { total: ${deaths.total}, byTeamkills: ${deaths.byTeamkills} },`);
    console.log(`lastPlayedGameDate: '${lastDate}', kdRatio: ${kdRatio}, totalScore: ${score}, weapons: generateDefaultWeapons(${kills}),`);
    console.log('byWeeks: [');
    byWeeks.reverse().forEach((week) => {
      console.log('{');
      console.log(`week: '${week.week}', startDate: '${week.startDate}', endDate: '${week.endDate}',`);
      console.log(`totalPlayedGames: ${week.totalPlayedGames}, kills: ${week.kills}, vehicleKills: ${week.vehicleKills}, teamkills: ${week.teamkills}, deaths: { total: ${week.deaths.total}, byTeamkills: ${week.deaths.byTeamkills} }, kdRatio: ${week.kdRatio}, score: ${week.score},`);
      console.log('},');
    });
    console.log(']');
    console.log('},');
  });

  console.log('],');
})();
