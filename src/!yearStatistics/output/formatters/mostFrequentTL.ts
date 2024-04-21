import { colorsByPlace, titles } from '../../utils/consts';

const mostFrequentTLFormatter = (
  { mostFrequentTL }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostFrequentTL}]Топ 10 игроков которые чаще всего занимают слот КО:
(не учитываются слоты КС-ов)\n`;

  mostFrequentTL.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], кол-во игр: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostFrequentTLFormatter;
