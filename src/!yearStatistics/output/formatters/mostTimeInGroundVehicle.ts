import { colorsByPlace, titles } from '../../utils/consts';

const mostTimeInGroundVehicleFormatter = (
  { mostTimeInGroundVehicle }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostTimeInGroundVehicle}]Топ 10 игроков, которые провели больше всего времени в наземной технике:
(время считается только пока игрок управляет живым юнитом)\n`;

  mostTimeInGroundVehicle.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], время (чч:мм:сс): ${nominee.time};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostTimeInGroundVehicleFormatter;
