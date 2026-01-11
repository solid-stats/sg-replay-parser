import { round } from 'lodash';

import { colorsByPlace } from '../../../utils/consts';

const getRandomshikNomineeTextLine = (nominee: RandomshikNominee, index: number): string => (
  `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], пройденная дистанция пешком: ${Intl.NumberFormat('ru-RU').format(nominee.distance)} м, убийств игроков: ${nominee.kills}, средняя пройденная дистанция для одного убийства: ${Intl.NumberFormat('ru-RU').format(round(nominee.distance / nominee.kills))} м;\n`
);

export default getRandomshikNomineeTextLine;
