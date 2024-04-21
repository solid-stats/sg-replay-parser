import { colorsByPlace, titles } from '../../utils/consts';

const mostWalkedDistanceFormatter = (
  { mostWalkedDistance }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostWalkedDistance}]Топ 10 игроков, которые дальше всех ходили пешком:\n`;

  mostWalkedDistance.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], дистанция: ${nominee.distance} м;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostWalkedDistanceFormatter;
