import { colorsByPlace, titles } from '../../utils/consts';

const mostTeamkillsInOneGameFormatter = (
  { mostTeamkillsInOneGame }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostTeamkillsInOneGame}][img]https://media.discordapp.net/attachments/774374735634628639/1059919818255519814/unknown.png[/img]
Список игроков, которых страшнее всего встретить рядом с собой или за штурвалом.

Топ 10 по убийствам союзников за одну игру:\n`;

  mostTeamkillsInOneGame.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], тимкиллов: ${nominee.count}, миссия на которой произошел ТК: ${nominee.missionName};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostTeamkillsInOneGameFormatter;
