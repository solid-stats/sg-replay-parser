import { addWeaponStatistic, filterWeaponStatistics } from '../0 - utils/weaponsStatistic';

const getKillsAndDeaths = (playersList: PlayersList, events: ReplayInfo['events']): PlayersList => {
  const players = { ...playersList };

  events.forEach((event) => {
    const eventType = event[1];

    if (eventType === 'killed') {
      const [
        , ,
        killedId,
        [killerId, weapon],
        distance,
      ] = event;

      const killed = players[killedId];
      const killer = players[killerId];

      if (!(killed && killer)) return;

      const isSameSide = killer.side === killed.side;
      const weaponsStatistics = addWeaponStatistic(killer.weapons, weapon, distance);
      const weapons = filterWeaponStatistics(weaponsStatistics);

      players[killedId] = {
        ...players[killedId],
        isDead: true,
        isDeadByTeamkill: isSameSide,
      };
      players[killerId] = {
        ...players[killerId],
        kills: isSameSide ? killer.kills : killer.kills + 1,
        teamkills: isSameSide ? killer.teamkills + 1 : killer.teamkills,
        weapons,
      };
    }
  });

  return players;
};

export default getKillsAndDeaths;
