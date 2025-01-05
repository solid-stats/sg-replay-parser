import { colorsByPlace, titles } from '../../utils/consts';

const mostDeathsFromTeamkillsFormatter = (
  { mostDeathsFromTeamkills }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostDeathsFromTeamkills}]Список самых неудачливых игроков, которым в этом году не давали играть.

Топ по количеству смертей от союзников:\n`;

  mostDeathsFromTeamkills.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], смертей от союзников: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostDeathsFromTeamkillsFormatter;
