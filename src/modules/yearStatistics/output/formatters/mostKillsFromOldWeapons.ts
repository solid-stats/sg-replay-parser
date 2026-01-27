import { colorsByPlace, titles } from '../../utils/consts';

const mostKillsFromOldWeaponsFormatter = (
  { mostKillsFromOldWeapons }: WholeYearStatisticsResult,
): string => {
  let text = `[spoiler=${titles.mostKillsFromOldWeapons}]Деды, которые наиболее эффективно использовали раритетное оружие:\n`;

  mostKillsFromOldWeapons.nominations.forEach(
    (nominee, index) => {
      const mostKilledWeapon = Object.keys(nominee.weapons)
        .reduce((maxKey, key) => (
          nominee.weapons[key] > nominee.weapons[maxKey] ? key : maxKey
        ));

      text += `[color=${colorsByPlace[index] || '#fff'}]${index + 1}.[/color] [user]${nominee.name}[/user], убийств: ${nominee.count}, любимое оружие: ${mostKilledWeapon};\n`;
    },
  );

  text += '[/spoiler]';
  text += '\n\n';

  mostKillsFromOldWeapons.weaponNames.forEach(
    (weaponName) => { text += `${weaponName}\n`; },
  );

  return text;
};

export default mostKillsFromOldWeaponsFormatter;
