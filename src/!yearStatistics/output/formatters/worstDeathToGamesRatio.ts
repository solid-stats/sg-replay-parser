import { colorsByPlace, titles } from '../../utils/consts';

const worstDeathToGamesRatioFormatter = (
  { worstDeathToGamesRatio }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.worstDeathToGamesRatio}]Самые агрессивные игроки с наименьшим процентом выживания:\n`;

  worstDeathToGamesRatio.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], всего игр: ${nominee.totalPlayedGames}, смертей: ${nominee.deaths}, выживаемость: ${nominee.ratio}%;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default worstDeathToGamesRatioFormatter;
