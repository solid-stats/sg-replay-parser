import { colorsByPlace, titles } from '../../utils/consts';

const mostDistantKillFormatter = (
  { mostDistantKill }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostDistantKill}][youtube]https://youtu.be/xNwsrnMiDZA?si=Qc7UY1JqHbRjrN_5[/youtube]
SIMP'ы, которые сделали самое дальнее убийство из ручного оружия:
(учитывается только оружие калибра .308/7.62x54 или выше)\n`;

  for (let index = 0; index < 10; index += 1) {
    text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]игрок[/user], оружие: оружие, дистанция: 0 м;\n`;
  }

  text += '[/spoiler]';
  text += '\n\n\n';

  mostDistantKill.forEach(
    (nominee) => {
      text += [nominee.playerName, nominee.weaponName, Intl.NumberFormat('ru-RU').format(nominee.maxDistance), nominee.replayLink, nominee.replayTime, nominee.roleDescription].join(', ');
      text += '\n';
    },
  );

  return (text);
};

export default mostDistantKillFormatter;
