import { colorsByPlace, titles } from '../../utils/consts';

const mostTimeAliveFormatter = (
  { mostTimeAlive }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostTimeAlive}]Игроки, которые провели больше всего времени в игре:
(время считается только пока игрок управляет живым юнитом)\n`;

  mostTimeAlive.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], время (чч:мм:сс): ${nominee.time};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostTimeAliveFormatter;
