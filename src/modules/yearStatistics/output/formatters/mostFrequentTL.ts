import { round } from 'lodash';

import { colorsByPlace, titles } from '../../utils/consts';

const mostFrequentTLFormatter = (
  { mostFrequentTL }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostFrequentTL}]Игроки, которые чаще всего занимают слот КО:
(не учитываются слоты КС-ов)\n`;

  mostFrequentTL.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], кол-во игр: ${nominee.count}, частота занятия слота: ${round((nominee.count / nominee.totalPlayedGames) * 100)}%;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostFrequentTLFormatter;
