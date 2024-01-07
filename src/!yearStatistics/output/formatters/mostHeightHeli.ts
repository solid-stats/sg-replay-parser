import { colorsByPlace, titles } from '../../utils/consts';

const mostHeightHeliFormatter = (
  { mostHeightHeli }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostHeightHeli}]Топ 10 максимальной высоты на вертолетах:
(высота считается до земли или до морского дна (если техника над водой)\n`;

  mostHeightHeli.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.playerName}[/user], вертолет: ${nominee.vehicleName}, высота: ${nominee.height} м;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostHeightHeliFormatter;
