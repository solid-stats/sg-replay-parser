import { keyBy, uniq } from 'lodash';

import { dayjsUTC } from '../../../shared/utils/dayjs';
import getPlayerName from '../../../shared/utils/getPlayerName';
import { getPlayerId } from '../../../shared/utils/namesHelper/getId';
import getEntities from '../../parsing/getEntities';
import { secondsInFrame } from '../utils/consts';
import formatTime from '../utils/formatTime';
import getPlayerNameAtEndOfTheYear from '../utils/getPlayerNameAtEndOfTheYear';
import limitAndOrder from '../utils/limitAndOrder';

const ignoredWeapons = [
  'fim-92',
  '9k32m',
  'fgm-148',
  '9k38',
  'ak-74',
  'm4',
  'm16',
  'm27',
  'm416',
  'pk',
  'maaws',
  'smaw',
  'm240',
  'm249',
  'rpg',
  'm136',
];

export const sortMostDistantKill = (
  statistics: WholeYearStatisticsResult,
): WholeYearStatisticsResult => ({
  ...statistics,
  mostDistantKill: limitAndOrder(statistics.mostDistantKill, 'maxDistance', 'desc', 200),
});

const mostDistantKill = ({
  result,
  replayInfo,
  ...other
}: InfoForRawReplayProcess): InfoForRawReplayProcess => {
  const nomineesById = keyBy(result.mostDistantKill, 'playerId') as NomineeList<MostDistantKill>;
  const { players, vehicles } = getEntities(replayInfo);
  const vehiclesName = uniq(Object.values(vehicles).map((vehicle) => vehicle.name.toLowerCase()));

  replayInfo.events.forEach((event) => {
    const eventType = event[1];

    if (eventType !== 'killed') return;

    // eslint-disable-next-line array-element-newline
    const [frame, , killedId, killInfo, distance] = event;
    const killedEntity = replayInfo.entities[killedId];

    if (killInfo[0] === 'null' || !killInfo[1] || !killedEntity) return;

    const [killerId, weaponName] = killInfo;
    const killer = players[killerId];
    const killerEntity = replayInfo.entities[killerId];

    if (
      vehiclesName.includes(weaponName.toLowerCase())
      || ignoredWeapons.some((ignoredWeapon) => weaponName.toLowerCase().includes(ignoredWeapon))
      || !killer
      || killerEntity.type === 'vehicle'
      || killedEntity.type === 'vehicle'
      || killerEntity.side === killedEntity.side
    ) return;

    const entityName = getPlayerName(killer.name)[0];
    const playerId = getPlayerId(entityName, dayjsUTC(other.replay.date));
    const name = getPlayerNameAtEndOfTheYear(playerId) ?? entityName;

    const roleDescription = killerEntity.description.toLowerCase();
    const replayLink = `https://sg.zone${other.replay.replayLink}`;

    const currentNominee: MostDistantKill = nomineesById[playerId] || {
      playerId,
      playerName: name,
      weaponName,
      maxDistance: 0,
      roleDescription,
      replayLink,
    };

    if (currentNominee.maxDistance < distance && distance >= 1000 && distance <= 3000) {
      nomineesById[playerId] = {
        playerId,
        playerName: name,
        weaponName,
        maxDistance: distance,
        roleDescription,
        replayLink,
        replayTime: formatTime(frame * secondsInFrame),
      };
    }
  });

  return {
    ...other,
    replayInfo,
    result: {
      ...result,
      mostDistantKill: Object.values(nomineesById),
    },
  };
};

export default mostDistantKill;
