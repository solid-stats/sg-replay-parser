import random from 'lodash/random';

import { dayjsUTC } from '../../../../0 - utils/dayjs';
import { generatePlayerInfo, GeneratorSide } from '../../1 - replays, 2 - parseReplayInfo/utils';

export type TestPlayer = {
  name: string;
  side: GeneratorSide;
};

const getKills = () => random(4);
const getVehicleKills = () => random(2);
const getTeamkills = () => random(2);
const getIsDead = () => random(1) === 1;
const getIsDeadByTeamkill = (isDead: boolean) => (isDead ? random(10) <= 2 : false);

const createPlayerInfo = (
  name: PlayerName,
  id: EntityId,
  side: GeneratorSide,
): PlayerInfo => {
  const kills = getKills();
  const vehicleKills = getVehicleKills();
  const teamkills = getTeamkills();
  const isDead = getIsDead();
  const isDeadByTeamkill = getIsDeadByTeamkill(isDead);

  const playerInfo = generatePlayerInfo({
    id,
    name,
    side,
    kills,
    vehicleKills,
    teamkills,
    isDead,
    isDeadByTeamkill,
  });

  return playerInfo;
};

// should be 2 games per day and 4 games per week
// the games are on Friday and Saturday
const generateDays = (startDate: string, gamesCount: number) => {
  let date = dayjsUTC(startDate).day(5).hour(18);

  const days: string[] = [date.toJSON()];

  for (let index = 1; index < gamesCount; index += 1) {
    const isNextDay = index % 2 === 0;
    const isNextWeek = index % 4 === 0;

    if (isNextDay && !isNextWeek) date = date.add(1, 'd').subtract(2, 'h');

    if (isNextWeek) date = date.add(1, 'w').subtract(1, 'd').subtract(2, 'h');

    if (!(isNextDay || isNextWeek)) date = date.add(2, 'h');

    days.push(date.toJSON());
  }

  return days;
};

const generatePlayersGameResult = (
  players: TestPlayer[],
  // the gamesCount must be a multiple of 4
  gamesCount: number,
  startDate: string,
): PlayersGameResult[] => {
  const dates = generateDays(startDate, gamesCount);
  const playersGameResult: PlayersGameResult[] = [];

  for (let index = 0; index < gamesCount; index += 1) {
    const date = dates[index];

    const result: PlayerInfo[] = players.map(
      (player, id) => createPlayerInfo(player.name, id, player.side),
    );

    playersGameResult[index] = {
      date,
      missionName: '',
      result,
    };
  }

  return playersGameResult;
};

export default generatePlayersGameResult;
