import { colorsByPlace, titles } from '../../utils/consts';

const mostHeightPlaneFormatter = (
  { mostHeightPlane }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostHeightPlane}]Топ 10 максимальной высоты на самолетах:
(высота считается до земли или до морского дна (если техника над водой)\n`;

  mostHeightPlane.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.playerName}[/user], самолет: ${nominee.vehicleName}, высота: ${nominee.height} м;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostHeightPlaneFormatter;
