import { colorsByPlace, titles } from '../../utils/consts';

const mostKillsFromOldWeaponsFormatter = (
  { mostKillsFromOldWeapons }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostKillsFromOldWeapons}]Топ 10 дедов, которые наиболее эффективно использовали оружие, поставленное на вооружение до 70-ых годов прошлого века:\n`;

  mostKillsFromOldWeapons.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], убийств: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostKillsFromOldWeaponsFormatter;
