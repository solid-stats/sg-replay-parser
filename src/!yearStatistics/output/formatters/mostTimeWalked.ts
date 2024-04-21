import { colorsByPlace, titles } from '../../utils/consts';

const mostTimeWalkedFormatter = (
  { mostTimeWalked }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostTimeWalked}]Топ 10 игроков, которые провели больше всего времени на своих двоих:
(время считается только пока игрок управляет живым юнитом)\n`;

  mostTimeWalked.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], время (чч:мм:сс): ${nominee.time};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostTimeWalkedFormatter;
