import { keyBy, uniq } from 'lodash';

import { dayjsUTC } from '../../0 - utils/dayjs';
import getPlayerName from '../../0 - utils/getPlayerName';
import { getPlayerId } from '../../0 - utils/namesHelper/getId';
import { forbiddenWeapons } from '../../0 - utils/weaponsStatistic';
import getEntities from '../../2 - parseReplayInfo/getEntities';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

export const sortMostKillsInCQB = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostKillsInCQB: limitAndOrder(statistics.mostKillsInCQB, 'count', 'desc'),
});

const mostKillsInCQB = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesById = keyBy(result.mostKillsInCQB, 'id') as NomineeList<DefaultCountNomination>;
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    // eslint-disable-next-line array-element-newline
    const [, , killedId, killInfo, distance] = event;

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

    if (distance > 50) return;

    const entityName = getPlayerName(killer.name)[0];
    const id = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(id) ?? entityName;

    const currentNominee: DefaultCountNomination = nomineesById[id] || { id, name, count: 0 };

    nomineesById[id] = {
      id,
      name,
      count: currentNominee.count + 1,
    };
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostKillsInCQB: Object.values(nomineesById),
    },
  };
};

export default mostKillsInCQB;
