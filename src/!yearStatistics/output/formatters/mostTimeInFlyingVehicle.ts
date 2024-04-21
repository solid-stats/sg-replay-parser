import { colorsByPlace, titles } from '../../utils/consts';

const mostTimeInFlyingVehicleFormatter = (
  { mostTimeInFlyingVehicle }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostTimeInFlyingVehicle}]Топ 10 игроков, которые провели больше всего времени в воздушной технике:
(время считается только пока игрок управляет живым юнитом)\n`;

  mostTimeInFlyingVehicle.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], время (чч:мм:сс): ${nominee.time};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostTimeInFlyingVehicleFormatter;
