import { defaultDistance, defaultWeapon } from '../consts';

const generateDefaultWeapons = (kills: WeaponStatistic['kills']): WeaponStatistic[] => (kills ? [{
  name: defaultWeapon,
  kills,
  maxDistance: defaultDistance,
}] : []);

export default generateDefaultWeapons;
