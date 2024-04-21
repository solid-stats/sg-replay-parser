import { round } from 'lodash';

import { colorsByPlace, titles } from '../../utils/consts';

const mostKillsFromCommanderSlotFormatter = (
  { mostKillsFromCommanderSlot }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostKillsFromCommanderSlot}]Топ 10 игроков, которые больше всех убивали на слоте КС или КО:\n`;

  mostKillsFromCommanderSlot.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], убито игроков: ${nominee.count}, частота занятия слота КО: ${round(nominee.slotFrequency * 100)}%;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostKillsFromCommanderSlotFormatter;
