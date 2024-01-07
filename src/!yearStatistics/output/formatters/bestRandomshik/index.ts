import { titles } from '../../../utils/consts';
import getRandomshikNomineeTextLine from './getTextLine';

const bestRandomshikFormatter = (
  { bestRandomshik }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.bestRandomshik}]Топ 10 самых эффективных рандомщиков:
(в номинации участвуют только те игроки, которые прошли более 500 000 м.)\n`;

  bestRandomshik.forEach((nominee, index) => {
    text += getRandomshikNomineeTextLine(nominee, index);
  });

  text += '[/spoiler]';

  return text;
};

export default bestRandomshikFormatter;
