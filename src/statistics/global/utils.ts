// eslint-disable-next-line import/prefer-default-export
export const calculateDeaths = (
  deaths: Deaths,
  isDead: boolean,
  isDeadByTeamkill: boolean,
): Deaths => {
  let totalDeaths = deaths.total;
  let deathsByTeamkills = deaths.byTeamkills;

  if (isDead) {
    if (isDeadByTeamkill) deathsByTeamkills += 1;
    else totalDeaths += 1;
  }

  return {
    total: totalDeaths,
    byTeamkills: deathsByTeamkills,
  };
};
