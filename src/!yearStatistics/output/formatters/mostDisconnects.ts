import { colorsByPlace, titles } from '../../utils/consts';

const mostDisconnectsFormatter = (
  { mostDisconnects }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostDisconnects}]Игроки с наибольшим количеством перезаходов:
(считается только когда игрок выходил после начала игры и потом заходил обратно в [b]живой юнит[/b])\n`;

  mostDisconnects.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], кол-во перезаходов: ${nominee.count}, игр в которых был хотя бы один перезаход: ${nominee.gamesWithAtLeastOneDisconnect};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostDisconnectsFormatter;
