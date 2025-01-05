import { colorsByPlace, titles } from '../../utils/consts';

const mostTimeInVehicleFormatter = (
  { mostTimeInVehicle }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostTimeInVehicle}]Игроки, которые провели больше всего времени в любой технике:
(время считается только пока игрок управляет живым юнитом)\n`;

  mostTimeInVehicle.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], время (чч:мм:сс): ${nominee.time};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostTimeInVehicleFormatter;
