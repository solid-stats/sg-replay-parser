type Params = {
  deaths: Deaths,
  isDead: boolean,
  isDeadByTeamkill: boolean,
};

const calculateDeaths = ({
  deaths,
  isDead,
  isDeadByTeamkill,
}: Params): Deaths => {
  let totalDeaths = deaths.total;
  let deathsByTeamkills = deaths.byTeamkills;

  if (isDead) {
    if (isDeadByTeamkill) deathsByTeamkills += 1;

    totalDeaths += 1;
  }

  return {
    total: totalDeaths,
    byTeamkills: deathsByTeamkills,
  };
};

export default calculateDeaths;
