import { colorsByPlace, titles } from '../../utils/consts';

const mostATKillsFormatter = (
  { mostATKills }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostATKills}]Игроков, которые эффективнее всего использовали гранатометы:
(иногда уничтожение техники может не засчитываться, если техника взорвалась не сразу)\n`;

  mostATKills.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.playerName}[/user], убито игроков: ${nominee.playersKilled}, уничтожено техники: ${nominee.vehiclesKilled}, всего: ${nominee.total};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default mostATKillsFormatter;
