import { Locale } from 'date-fns';
import { ru } from 'date-fns/locale';

type DateFnsOption = {
  locale: Locale,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6,
};

type DateFnsOptionsWithFirstWeekDate = DateFnsOption & {
  firstWeekContainsDate: 1 | 2 | 3 | 4 | 5 | 6 | 7,
};

export const dateFnsOptions: DateFnsOption = {
  locale: ru,
  weekStartsOn: 1,
};

export const dateFnsOptionsWithFirstWeekDate: DateFnsOptionsWithFirstWeekDate = {
  ...dateFnsOptions,
  firstWeekContainsDate: 4,
};

export const gameTypes: GameType[] = ['sg', 'mace'];

export const outputFolder = 'output';

export const parsedReplaysFileName = 'parsed_missions.json';

export const getParsedReplaysPath = (gameType: GameType): string => (
  `${outputFolder}/${gameType}/${parsedReplaysFileName}`
);
