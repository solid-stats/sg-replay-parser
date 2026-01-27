// in some situations (when the player changes the current game slot)
// there may be a situation when 2 entities are attached to one player
// and this leads to several additional total games played

import mergeOtherPlayers from '../../shared/utils/mergeOtherPlayers';
import { unionWeaponsStatistic } from '../../shared/utils/weaponsStatistic';

// in such situation we should left only one entity
const combineSamePlayersInfo = (entities: PlayersList): PlayerInfo[] => {
  const result: PlayerInfo[] = [];

  Object.values(entities).forEach((player) => {
    const prevEntityIndex = result.findIndex(
      (pl) => player.name === pl.name,
    );
    const prevEntity = result[prevEntityIndex];

    if (prevEntity) {
      result.splice(prevEntityIndex, 1);

      result.push({
        id: player.id,
        name: player.name,
        side: player.side,
        kills: prevEntity.kills + player.kills,
        killsFromVehicle: prevEntity.killsFromVehicle + player.killsFromVehicle,
        vehicleKills: prevEntity.vehicleKills + player.vehicleKills,
        teamkills: prevEntity.teamkills + player.teamkills,
        isDead: prevEntity.isDead || player.isDead,
        isDeadByTeamkill: prevEntity.isDeadByTeamkill || player.isDeadByTeamkill,
        weapons: unionWeaponsStatistic(prevEntity.weapons, player.weapons),
        vehicles: unionWeaponsStatistic(prevEntity.vehicles, player.vehicles),
        killers: mergeOtherPlayers(prevEntity.killers, player.killers),
        killed: mergeOtherPlayers(prevEntity.killed, player.killed),
        teamkillers: mergeOtherPlayers(prevEntity.teamkillers, player.teamkillers),
        teamkilled: mergeOtherPlayers(prevEntity.teamkilled, player.teamkilled),
      });

      return;
    }

    result.push(player);
  });

  return result;
};

export default combineSamePlayersInfo;
