import { colorsByPlace, titles } from '../../utils/consts';

const mostFrequentCSFormatter = (
  { mostFrequentCS }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostFrequentCS}]Топ 10 игроков, которые чаще всего занимают слот КС-а:\n`;

  mostFrequentCS.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], кол-во игр: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostFrequentCSFormatter;
