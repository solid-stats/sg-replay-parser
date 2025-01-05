import { colorsByPlace, titles } from '../../utils/consts';

const mostTeamkillsFormatter = (
  { mostTeamkills }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostTeamkills}]Список самых опасных игроков (для союзников).

Топ по количеству убитых союзников:\n`;

  mostTeamkills.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], тимкиллов: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostTeamkillsFormatter;
