import { colorsByPlace, titles } from '../../utils/consts';

const mostTeamkillsInOneGameFormatter = (
  { mostTeamkillsInOneGame }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostTeamkillsInOneGame}][img]https://i.imgur.com/0qd3lir.jpeg[/img]
Список игроков, которых страшнее всего встретить рядом с собой или за штурвалом.

Топ по убийствам союзников за одну игру:\n`;

  mostTeamkillsInOneGame.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], тимкиллов: ${nominee.count}, [url=https://sg.zone${nominee.link}]ссылка на реплей[/url];\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostTeamkillsInOneGameFormatter;
