import { calculateDeaths } from '../../../3 - statistics/global/utils';

type TestData = {
  params: Parameters<typeof calculateDeaths>[0];
  result: Deaths;
};

const tests: TestData[] = [
  {
    params: {
      deaths: {
        total: 0,
        byTeamkills: 0,
      },
      isDead: true,
      isDeadByTeamkill: false,
    },
    result: {
      total: 1,
      byTeamkills: 0,
    },
  },
  {
    params: {
      deaths: {
        total: 1,
        byTeamkills: 0,
      },
      isDead: true,
      isDeadByTeamkill: true,
    },
    result: {
      total: 2,
      byTeamkills: 1,
    },
  },
  {
    params: {
      deaths: {
        total: 5,
        byTeamkills: 3,
      },
      isDead: true,
      isDeadByTeamkill: true,
    },
    result: {
      total: 6,
      byTeamkills: 4,
    },
  },
  {
    params: {
      deaths: {
        total: 5,
        byTeamkills: 3,
      },
      isDead: true,
      isDeadByTeamkill: false,
    },
    result: {
      total: 6,
      byTeamkills: 3,
    },
  },
  {
    params: {
      deaths: {
        total: 5,
        byTeamkills: 3,
      },
      isDead: false,
      isDeadByTeamkill: false,
    },
    result: {
      total: 5,
      byTeamkills: 3,
    },
  },
  {
    params: {
      deaths: {
        total: 5,
        byTeamkills: 3,
      },
      isDead: false,
      isDeadByTeamkill: true,
    },
    result: {
      total: 5,
      byTeamkills: 3,
    },
  },
];

const generateDeathSourceText = (isDead: boolean, isDeadByTeamkill: boolean) => {
  if (isDead && isDeadByTeamkill) return 'death from teamkill';

  return 'death from enemy';
};

tests.map(({
  params, result,
}) => (
  test(`before: ${params.deaths.total} total deaths and ${params.deaths.byTeamkills} deaths by teamkills; ${generateDeathSourceText(params.isDead, params.isDeadByTeamkill)}; should be ${result.total} total deaths and ${result.byTeamkills} deaths by teamkills`, () => {
    expect(calculateDeaths(params)).toStrictEqual(result);
  })
));
