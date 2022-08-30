import { defaultDistance, defaultVehicle, defaultWeapon } from '../consts';

const generateDefaultWeapons = (kills: WeaponStatistic['kills'], type?: 'vehicle' | 'firearm'): WeaponStatistic[] => (kills ? [{
  name: type === 'vehicle' ? defaultVehicle : defaultWeapon,
  kills,
  maxDistance: defaultDistance,
}] : []);

export default generateDefaultWeapons;
