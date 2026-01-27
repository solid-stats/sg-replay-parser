import { colorsByPlace, titles } from '../../utils/consts';

const bestWeaponFormatter = (
  { bestWeapon }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.bestWeapon}]Оружие, из которого было убито больше всего игроков:\n`;

  bestWeapon.forEach(
    (nominee, index) => {
      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] ${nominee.name}, убийств: ${nominee.count};\n`;
    },
  );

  text += '[/spoiler]';

  return text;
};

export default bestWeaponFormatter;
