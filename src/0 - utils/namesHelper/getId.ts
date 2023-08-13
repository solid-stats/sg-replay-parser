import { Dayjs } from 'dayjs';

import { getNamesList } from '.';

import { findNameInfo } from './findNameInfo';

export const getPlayerId = (name: PlayerName, gameDate: Dayjs): PlayerId | PlayerName => {
  const namesList = getNamesList();

  if (!namesList) throw (new Error('Список смен ников не был инициализирован'));

  const loweredName = name.toLowerCase();

  const playerNameInfo = findNameInfo(namesList, loweredName, gameDate);

  if (!playerNameInfo) return loweredName;

  return playerNameInfo.info.id;
};
