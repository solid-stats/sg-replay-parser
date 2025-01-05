import { colorsByPlace, titles } from '../../utils/consts';

const mostPopularMissionMakerFormatter = (
  { mostPopularMissionMaker }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostPopularMissionMaker}]Картоделы, чьи миссии отыграли больше всего раз:\n`;

  for (let index = 0; index < 10; index += 1) {
    text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] автор: [user]автор[/user], кол-во отыгрышей: 0;\n`;
  }

  text += '[/spoiler]';
  text += '\n\n\n';

  mostPopularMissionMaker.forEach(
    (nominee) => {
      text += `${nominee.name}, кол-во отыгрышей: ${nominee.count};\n`;
    },
  );

  return (text);
};

export default mostPopularMissionMakerFormatter;
