import calculateKDRatio from './calculateKDRatio';

type TestData = {
  kills: Kills;
  teamkills: Teamkills;
  deaths: Deaths;
  result: number;
};

const tests: TestData[] = [
  {
    kills: 0,
    teamkills: 0,
    deaths: {
      total: 0,
      byTeamkills: 0,
    },
    result: 0,
  },
  {
    kills: 5,
    teamkills: 0,
    deaths: {
      total: 0,
      byTeamkills: 0,
    },
    result: 5,
  },
  {
    kills: 3,
    teamkills: 0,
    deaths: {
      total: 2,
      byTeamkills: 0,
    },
    result: 1.5,
  },
  {
    kills: 5,
    teamkills: 2,
    deaths: {
      total: 2,
      byTeamkills: 0,
    },
    result: 1.5,
  },
  {
    kills: 3,
    teamkills: 0,
    deaths: {
      total: 3,
      byTeamkills: 1,
    },
    result: 1.5,
  },
  {
    kills: 3,
    teamkills: 1,
    deaths: {
      total: 3,
      byTeamkills: 1,
    },
    result: 1,
  },
  {
    kills: 7,
    teamkills: 0,
    deaths: {
      total: 0,
      byTeamkills: 2,
    },
    result: 3.5,
  },
  {
    kills: 0,
    teamkills: 0,
    deaths: {
      total: 2,
      byTeamkills: 0,
    },
    result: 0,
  },
  {
    kills: 0,
    teamkills: 2,
    deaths: {
      total: 2,
      byTeamkills: 0,
    },
    result: -1,
  },
  {
    kills: 0,
    teamkills: 2,
    deaths: {
      total: 2,
      byTeamkills: 1,
    },
    result: -2,
  },
  {
    kills: 7,
    teamkills: 2,
    deaths: {
      total: 0,
      byTeamkills: 0,
    },
    result: 5,
  },
  {
    kills: 7,
    teamkills: 2,
    deaths: {
      total: 0,
      byTeamkills: 1,
    },
    result: 5,
  },
];

tests.map(({
  kills, teamkills, deaths, result,
}) => (
  test(`${kills} kills, ${teamkills} teamkills, ${deaths.total} deaths and ${deaths.byTeamkills} deaths by teamkills. Should return ${result} K/D`, () => {
    expect(calculateKDRatio(kills, teamkills, deaths)).toBe(result);
  })
));
