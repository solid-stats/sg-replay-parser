import { colorsByPlace, titles } from '../../utils/consts';

const mostPopularMissionFormatter = (
  { mostPopularMission }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostPopularMission}]Топ 10 миссий, которые отыграли больше всего раз:\n`;

  mostPopularMission.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [url=ссылка]${nominee.name}[/url], автор: [user]автор[/user], кол-во отыгрышей: ${nominee.count}, карта: ${nominee.map}, последний отыгрыш: ${nominee.lastPlayedDate};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostPopularMissionFormatter;
