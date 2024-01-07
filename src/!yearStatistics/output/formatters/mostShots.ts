import { colorsByPlace, titles } from '../../utils/consts';

const mostShotsFormatter = (
  { mostShots }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostShots}]Топ 10 игроков, которые сделали самое большое количество выстрелов:
(не учитываются выстрелы из техники)\n`;

  mostShots.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], всего выстрелов: ${nominee.count}, игр с хотя бы одним выстрелом: ${nominee.gamesCountWithAtleastOneShot};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostShotsFormatter;
