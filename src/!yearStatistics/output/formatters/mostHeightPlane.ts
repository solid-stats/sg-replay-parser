import { colorsByPlace, titles } from '../../utils/consts';

const mostHeightPlaneFormatter = (
  { mostHeightPlane }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostHeightPlane}]Топ максимальной высоты на самолете:
(высота считается до земли или до морского дна (если техника над водой))\n`;

  mostHeightPlane.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.playerName}[/user], самолет: ${nominee.vehicleName}, высота: ${Intl.NumberFormat('ru-RU').format(nominee.height)} м;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostHeightPlaneFormatter;
