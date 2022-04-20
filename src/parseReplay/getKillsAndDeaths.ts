const getKillsAndDeaths = (playersList: PlayersList, events: ReplayInfo['events']): PlayersList => {
  const players = { ...playersList };

  events.forEach((event) => {
    const eventType = event[1];

    if (eventType === 'killed') {
      const [, , killedId, [killerId]] = event;

      const killed = players[killedId];
      const killer = players[killerId];

      if (!(killed && killer)) return;

      const isSameSide = killer.side === killed.side;

      players[killedId] = {
        ...players[killedId],
        isDead: true,
      };
      players[killerId] = {
        ...players[killerId],
        kills: isSameSide ? killer.kills : killer.kills + 1,
        teamkills: isSameSide ? killer.teamkills + 1 : killer.teamkills,
      };
    }
  });

  return players;
};

export default getKillsAndDeaths;
