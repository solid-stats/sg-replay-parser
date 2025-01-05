import { colorsByPlace, titles } from '../../utils/consts';

const bestDeathToGamesRatioFormatter = (
  { bestDeathToGamesRatio }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.bestDeathToGamesRatio}]Самые осторожных игроки с наибольшим процентом выживания:\n`;

  bestDeathToGamesRatio.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], всего игр: ${nominee.totalPlayedGames}, смертей: ${nominee.deaths}, выживаемость: ${nominee.ratio}%;\n`;
    },
  );

  text += '[/spoiler]';

  return (text);
};

export default bestDeathToGamesRatioFormatter;
