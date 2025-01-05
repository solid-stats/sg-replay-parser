import { keyBy, round, uniq } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import { forbiddenWeapons } from '../../0 - utils/weaponsStatistic';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

export const sortBestRandomshik = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => {
  const threshold = 500000;
  const randomshiks = statistics.bestRandomshik.filter(
    (randomshik) => randomshik.distance >= threshold,
  );

  return {
    ...statistics,
    bestRandomshik: limitAndOrder(
      randomshiks,
      ['coef', 'distance', 'kills'],
      ['asc', 'desc', 'desc'],
    ),
  };
};

const bestRandomshik = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesById = keyBy(result.bestRandomshik, 'id') as NomineeList<RandomshikNominee>;
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    const [, , killedId, killInfo] = event;

    if (killInfo[0] === 'null' || !killInfo[1]) return;

    const [killerId, weaponName] = killInfo;
    const killer = players[killerId];
    const killerEntity = replayInfo.entities[killerId];

    if (
      vehiclesName.includes(weaponName.toLowerCase())
      || !killer
      || killerEntity.type === 'vehicle'
      || vehicles[killedId]
      || forbiddenWeapons.includes(weaponName.toLowerCase())
    ) return;

    const entityName = getPlayerName(killer.name)[0];
    const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

    const currentDistanceNominee = result.mostWalkedDistance.find((player) => player.id === id);

    if (!currentDistanceNominee) return;

    const distance = currentDistanceNominee.distance ?? 0;

    const currentNominee: RandomshikNominee = nomineesById[id] || {
      id,
      name,
      distance,
      kills: 0,
      coef: 0,
    };

    const kills = currentNominee.kills + 1;

    nomineesById[id] = {
      id,
      name,
      distance,
      kills,
      coef: round(distance / kills),
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      bestRandomshik: Object.values(nomineesById),
    },
  };
};

export default bestRandomshik;
