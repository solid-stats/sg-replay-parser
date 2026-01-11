import { colorsByPlace, titles } from '../../utils/consts';

const mostHeightHeliFormatter = (
  { mostHeightHeli }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostHeightHeli}]Топ максимальной высоты на вертолете:
(высота считается до земли или до морского дна (если техника над водой))\n`;

  mostHeightHeli.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.playerName}[/user], вертолет: ${nominee.vehicleName}, высота: ${Intl.NumberFormat('ru-RU').format(nominee.height)} м;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostHeightHeliFormatter;
