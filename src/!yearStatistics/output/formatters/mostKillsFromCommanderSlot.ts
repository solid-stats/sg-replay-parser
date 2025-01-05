import { round } from 'lodash';

import { colorsByPlace, titles } from '../../utils/consts';

const mostKillsFromCommanderSlotFormatter = (
  { mostKillsFromCommanderSlot }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostKillsFromCommanderSlot}]Самые эффективные командиры (КС и КО):\n`;

  mostKillsFromCommanderSlot.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], убито игроков: ${nominee.count}, частота занятия слота: ${round(nominee.slotFrequency * 100)}%;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostKillsFromCommanderSlotFormatter;
