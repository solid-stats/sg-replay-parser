// in some situations (when the player changes the current game slot)
// there may be a situation when 2 entities are attached to one player
// and this leads to several additional total games played
// in such situation we should left only one entity
const combineSamePlayers = (entities: VehiclesWithPlayersList): VehiclesWithPlayersList => {
  const result: VehiclesWithPlayersList = {
    players: {},
    vehicles: entities.vehicles,
  };

  Object.values(entities.players).forEach((player) => {
    const prevEntity = Object.values(result.players).find(
      (pl) => player.name === pl.name,
    );

    if (prevEntity) delete result.players[prevEntity.id];

    result.players[player.id] = player;
  });

  return result;
};

export default combineSamePlayers;
