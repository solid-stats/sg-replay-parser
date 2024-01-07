import { round } from 'lodash';

import { colorsByPlace } from '../../../utils/consts';

const getRandomshikNomineeTextLine = (nominee: RandomshikNominee, index: number): string => (
  `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], пройденная дистанция пешком: ${nominee.distance} м, убийств игроков: ${nominee.kills}, средняя пройденная дистанция для одного убийства: ${round(nominee.coef)} м;\n`
);

export default getRandomshikNomineeTextLine;
