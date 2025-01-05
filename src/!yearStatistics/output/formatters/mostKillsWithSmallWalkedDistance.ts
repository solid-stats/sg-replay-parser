import { colorsByPlace, titles } from '../../utils/consts';

// eslint-disable-next-line id-length
const mostKillsWithSmallWalkedDistanceFormatter = (
  { mostKillsWithSmallWalkedDistance }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostKillsWithSmallWalkedDistance}]Камни, которые убивали игроков пройдя менее 1000 м за игру (дистанция пройденная в технике не учитывается):\n`;

  mostKillsWithSmallWalkedDistance.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], убийств: ${nominee.count}, минимальная пройденная дистанция: ${nominee.minDistance} м;\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostKillsWithSmallWalkedDistanceFormatter;
