import { colorsByPlace, titles } from '../../utils/consts';

const mostAAKillsFormatter = (
  { mostAAKills }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostAAKills}]Игроки сбившее наибольшее количество воздушной техники из ПЗРК:
(засчитывается уничтожение из любого оружия всех ЛА, кроме маленьких дронов типа Darter, Tayran и т.п.)\n`;

  mostAAKills.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], уничтожено ЛА: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostAAKillsFormatter;
