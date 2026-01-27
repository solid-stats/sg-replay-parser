import calculateScore from './calculateScore';

type TestData = {
  playedGames: number;
  kills: Kills;
  teamkills: Teamkills;
  deaths: Deaths;
  result: number;
};

const total = 0;
const defaultValues: TestData = {
  playedGames: 50,
  kills: 100,
  teamkills: 0,
  deaths: {
    total,
    byTeamkills: 0,
  },
  result: 2,
};
const tests: TestData[] = [
  defaultValues,
  {
    ...defaultValues,
    teamkills: 7,
    result: 1.86,
  },
  {
    ...defaultValues,
    teamkills: 7,
    deaths: {
      total,
      byTeamkills: 12,
    },
    result: 2.45,
  },
  {
    ...defaultValues,
    deaths: {
      total,
      byTeamkills: 12,
    },
    result: 2.63,
  },
  {
    playedGames: 2,
    kills: 0,
    teamkills: 0,
    deaths: {
      byTeamkills: 2,
      total: 0,
    },
    result: 0,
  },
  {
    playedGames: 2,
    kills: 4,
    teamkills: 0,
    deaths: {
      byTeamkills: 2,
      total: 0,
    },
    result: 4,
  },
];

tests.map(({
  playedGames, kills, teamkills, deaths, result,
}) => (
  test(`${playedGames} played games, ${kills} kills, ${teamkills} teamkills and ${deaths.byTeamkills} deaths by teamkills. Should return ${result} score`, () => {
    expect(calculateScore(playedGames, kills, teamkills, deaths)).toBe(result);
  })
));
