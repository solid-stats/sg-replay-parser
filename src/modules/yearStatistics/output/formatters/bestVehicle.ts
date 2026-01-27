import { colorsByPlace, titles } from '../../utils/consts';

const bestVehicleFormatter = (
  { bestVehicle }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.bestVehicle}]Техника, из которой было убито больше всего игроков:\n`;

  bestVehicle.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] ${nominee.name}, убийств: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default bestVehicleFormatter;
