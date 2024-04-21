export const year = 2023;

export const titles: Record<keyof WholeYearStatisticsResult, string> = {
  bestDeathToGamesRatio: 'Нео, ты не в матрице',
  worstDeathToGamesRatio: 'Зачем жить, если можно умереть',
  mostTeamkillsInOneGame: 'А почему они отступили',
  mostTeamkills: 'Бей своих чтоб чужие боялись!',
  mostShots: 'Я заплатил за весь боезапас',
  mostPopularMission: 'Самая часто встречаемая миссия',
  mostPopularMissionMaker: 'Самый часто встречаемый картодел',
  mostDisconnects: 'Шнуродёр',
  mostFrequentCS: 'Самый частый командир стороны',
  mostFrequentTL: 'Самый частый командир отделения',
  bestWeapon: 'Самое смертоносное оружие',
  bestVehicle: 'Самая смертоносная техника',
  mostDistantKill: 'SIMP', // https://youtu.be/xNwsrnMiDZA?si=Qc7UY1JqHbRjrN_5 xD
  mostATKills: 'Лучший трубочист',
  mostAAKills: 'Москитная сетка',
  mostWalkedDistance: 'Беги, Лес, беги!',
  mostDistanceInVehicle: 'Уехал искать свое счастье...',
  mostHeightHeli: 'Почему высотомер перестал работать? (вертолеты)',
  mostHeightPlane: 'Почему высотомер перестал работать? (самолеты)',
  mostTimeAlive: 'Задрот года',
  mostTimeWalked: 'Задрот года (в пехоте)',
  mostTimeInVehicle: 'Задрот года (в технике)',
  mostTimeInGroundVehicle: 'Задрот года (в наземной технике)',
  mostTimeInFlyingVehicle: 'Задрот года (в летающей технике)',
  mostDeathsFromTeamkills: 'Да почему опять я?!',
  mostKillsFromOldWeapons: 'Дед пей таблетки а то получишь по жопе',
  mostKillsFromCommanderSlot: 'Командир единоличник',
  mostKillsInCQB: 'Близорукий',
  bestRandomshik: 'Лучший рандомщик',
  mostKillsFromMedicSlot: 'Не лечит, а калечит',
};

export const defaultResult: WholeYearStatisticsResult = {
  bestDeathToGamesRatio: [],
  worstDeathToGamesRatio: [],
  mostTeamkillsInOneGame: [],
  mostTeamkills: [],
  mostShots: [],
  mostPopularMission: [],
  mostPopularMissionMaker: [],
  mostDisconnects: [],
  mostFrequentCS: [],
  mostFrequentTL: [],
  mostDistantKill: [],
  bestVehicle: [],
  bestWeapon: [],
  mostATKills: [],
  mostAAKills: [],
  mostWalkedDistance: [],
  mostDistanceInVehicle: [],
  mostHeightHeli: [],
  mostHeightPlane: [],
  mostTimeAlive: [],
  mostTimeWalked: [],
  mostTimeInVehicle: [],
  mostTimeInGroundVehicle: [],
  mostTimeInFlyingVehicle: [],
  mostDeathsFromTeamkills: [],
  mostKillsFromOldWeapons: [],
  mostKillsFromCommanderSlot: [],
  mostKillsInCQB: [],
  bestRandomshik: [],
  mostKillsFromMedicSlot: [],
};

// array means several nomination in one message
export const nominationsOrder: NominationsOrder = [
  ['bestDeathToGamesRatio', 'worstDeathToGamesRatio'],
  ['mostTeamkillsInOneGame', 'mostTeamkills', 'mostDeathsFromTeamkills'],
  ['mostShots', 'mostDistantKill'],
  ['mostPopularMission', 'mostPopularMissionMaker'],
  'mostDisconnects',
  ['mostFrequentCS', 'mostFrequentTL'],
  ['bestWeapon', 'bestVehicle'],
  ['mostKillsFromOldWeapons', 'mostKillsInCQB'],
  ['mostKillsFromCommanderSlot', 'mostKillsFromMedicSlot'],
  ['mostATKills', 'mostAAKills'],
  ['mostHeightHeli', 'mostHeightPlane'],
  ['mostWalkedDistance', 'mostDistanceInVehicle'],
  'bestRandomshik',
  ['mostTimeAlive', 'mostTimeWalked', 'mostTimeInVehicle', 'mostTimeInGroundVehicle', 'mostTimeInFlyingVehicle'],
];

export const colorsByPlace = [
  '#ffd700',
  '#c0c0c0',
  '#cd7f32',
];

export const maxRecords = 10;

export const defaultTimeDuration: DefaultTimeNomination['time'] = '00:00:00:00';

export const groundVehicle: RawVehicleClass[] = ['apc', 'car', 'tank', 'truck', 'static-weapon'];

export const flyingVehicle: RawVehicleClass[] = ['heli', 'plane'];

export const secondsInFrame = 5;
