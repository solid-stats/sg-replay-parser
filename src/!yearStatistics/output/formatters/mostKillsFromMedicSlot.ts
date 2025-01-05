import { round } from 'lodash';

import { colorsByPlace, titles } from '../../utils/consts';

const mostKillsFromMedicSlotFormatter = (
  { mostKillsFromMedicSlot }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostKillsFromMedicSlot}]Самые неправильные медики:\n`;

  mostKillsFromMedicSlot.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], убито игроков: ${nominee.count}, частота занятия слота медика: ${round(nominee.slotFrequency * 100)}%;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostKillsFromMedicSlotFormatter;
