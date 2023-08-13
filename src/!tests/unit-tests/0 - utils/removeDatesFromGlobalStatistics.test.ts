import { dayjsUTC, dayjsUTCISO } from '../../../0 - utils/dayjs';
import removeDatesFromGlobalStatistics from '../../../0 - utils/removeDatesFromGlobalStatistics';
import getDefaultTestDescription from '../../utils/getDefaultTestDescription';

const globalStatistics: GlobalPlayerStatistics[] = [{
  id: '_',
  name: '',
  isShow: true,
  lastSquadPrefix: null,
  lastPlayedGameDate: dayjsUTCISO(),
  totalPlayedGames: 0,
  kills: 0,
  killsFromVehicle: 0,
  vehicleKills: 0,
  teamkills: 0,
  deaths: { total: 0, byTeamkills: 0 },
  kdRatio: 0,
  killsFromVehicleCoef: 0,
  totalScore: 0,
  weapons: [],
  vehicles: [],
  killed: [],
  killers: [],
  teamkilled: [],
  teamkillers: [],
  byWeeks: [{
    week: dayjsUTC().format('GGGG-WW') as WeekNumber,
    startDate: dayjsUTC().startOf('isoWeek').toISOString(),
    endDate: dayjsUTC().endOf('isoWeek').toISOString(),
    totalPlayedGames: 0,
    kills: 0,
    killsFromVehicle: 0,
    vehicleKills: 0,
    teamkills: 0,
    deaths: { total: 0, byTeamkills: 0 },
    kdRatio: 0,
    killsFromVehicleCoef: 0,
    score: 0,
  }],
}];

const result: GlobalPlayerStatisticsWithoutDates[] = [{
  id: '_',
  name: '',
  isShow: true,
  lastSquadPrefix: null,
  totalPlayedGames: 0,
  kills: 0,
  killsFromVehicle: 0,
  vehicleKills: 0,
  teamkills: 0,
  deaths: { total: 0, byTeamkills: 0 },
  kdRatio: 0,
  killsFromVehicleCoef: 0,
  totalScore: 0,
  weapons: [],
  vehicles: [],
  killed: [],
  killers: [],
  teamkilled: [],
  teamkillers: [],
  byWeeks: [{
    totalPlayedGames: 0,
    kills: 0,
    killsFromVehicle: 0,
    vehicleKills: 0,
    teamkills: 0,
    deaths: { total: 0, byTeamkills: 0 },
    kdRatio: 0,
    killsFromVehicleCoef: 0,
    score: 0,
  }],
}];

test(getDefaultTestDescription('removeDatesFromGlobalStatistics'), () => {
  expect(removeDatesFromGlobalStatistics(globalStatistics)).toMatchObject(result);
});
