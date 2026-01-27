import { colorsByPlace, titles } from '../../utils/consts';

const mostPlaneKillsFromPlaneFormatter = (
  { mostPlaneKillsFromPlane }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostPlaneKillsFromPlane}][youtube]https://youtu.be/siwpn14IE7E?si=VMDtrSmvSSzYEOpm&t=29[/youtube]
Пилоты, которые чаще остальных побеждали в догфайтах:\n`;

  mostPlaneKillsFromPlane.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], побед: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostPlaneKillsFromPlaneFormatter;
