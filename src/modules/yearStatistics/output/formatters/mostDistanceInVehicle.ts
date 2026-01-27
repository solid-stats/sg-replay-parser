import { colorsByPlace, titles } from '../../utils/consts';

const mostDistanceInVehicleFormatter = (
  { mostDistanceInVehicle }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostDistanceInVehicle}]Игроки, которые больше всего проехали на технике:\n`;

  mostDistanceInVehicle.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], дистанция: ${Intl.NumberFormat('ru-RU').format(nominee.distance)} м;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostDistanceInVehicleFormatter;
