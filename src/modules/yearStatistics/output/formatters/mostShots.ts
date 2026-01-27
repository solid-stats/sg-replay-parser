import { colorsByPlace, titles } from '../../utils/consts';

const mostShotsFormatter = (
  { mostShots }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostShots}]Игроки сделавшие самое большое количество выстрелов:
(не учитываются выстрелы из техники)\n`;

  mostShots.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], всего выстрелов: ${Intl.NumberFormat('ru-RU').format(nominee.count)}, игр с хотя бы одним выстрелом: ${nominee.gamesCountWithAtleastOneShot};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostShotsFormatter;
