import { colorsByPlace, titles } from '../../utils/consts';

const mostKillsFromMedicSlotFormatter = (
  { mostKillsFromMedicSlot }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostKillsFromMedicSlot}]Самые неправильные медики:\n`;

  mostKillsFromMedicSlot.nominations.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], убито игроков: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';
  text += '\n\n';

  mostKillsFromMedicSlot.slotNames.forEach(
    (slotName) => { text += `${slotName}\n`; },
  );

  return text;
};

export default mostKillsFromMedicSlotFormatter;
