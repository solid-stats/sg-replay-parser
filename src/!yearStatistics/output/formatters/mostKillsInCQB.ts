import { colorsByPlace, titles } from '../../utils/consts';

const mostKillsInCQBFormatter = (
  { mostKillsInCQB }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostKillsInCQB}]Топ 10 игроков, которые больше всего убивали на дистанции ближе 50 метров:\n`;

  mostKillsInCQB.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], убийств: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostKillsInCQBFormatter;
