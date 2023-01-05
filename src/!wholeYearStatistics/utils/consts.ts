export const titles: Record<keyof WholeYearStatisticsResult, string> = {
  bestDeathToGamesRatio: 'Нео, ты не в матрице',
  worstDeathToGamesRatio: 'Зачем жить если можно умереть',
  mostTeamkillsInOneGame: 'А почему они отступили',
  mostTeamkills: 'Бей своих чтоб чужие боялись!',
  mostShots: 'Я заплатил за весь боезопас',
  mostPopularMission: 'Самая часто встречаемая миссия',
  mostPopularMissionMaker: 'Самый часто встречаемый картодел',
  mostDisconnects: 'Шнуродёр',
  mostFrequentCS: 'Самый частый командир стороны',
  mostFrequentTL: 'Самый частый командир отделения',
  mostDistantKill: 'SIMP (Sniper monkey)', // https://www.youtube.com/watch?v=xNwsrnMiDZA xD
  bestWeapon: 'Самое смертоносное оружие ',
  bestVehicle: 'Самая смертоносная техника',
  mostATKills: 'Лучший трубочист',
  mostWalkedDistance: 'Беги, Лес, беги!',
  mostDistanceInVehicle: 'Уехал искать свое счастье...',
  mostHeightHeli: 'Почему высотомер перестал работать? (вертолеты)',
  mostHeightPlane: 'Почему высотомер перестал работать? (самолеты)',
  mostTimeAlive: 'Задрот года',
  mostTimeWalked: 'Задрот года (в пехоте)',
  mostTimeInGroundVehicle: 'Задрот года (в наземной технике) ',
  mostTimeInFlyingVehicle: 'Задрот года (в летающей технике) ',
  mostFlyingTimeInGroundVehicle: 'Лучшие кандидаты для космической программы Польши',
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
  mostWalkedDistance: [],
  mostDistanceInVehicle: [],
  mostHeightHeli: [],
  mostHeightPlane: [],
  mostTimeAlive: [],
  mostTimeWalked: [],
  mostTimeInGroundVehicle: [],
  mostTimeInFlyingVehicle: [],
  mostFlyingTimeInGroundVehicle: [],
};

export const maxRecords = 20;

export const defaultTimeDuration: DefaultTimeNomination['time'] = '00:00:00:00';

export const groundVehicle: RawVehicleClass[] = ['apc', 'car', 'tank', 'truck', 'static-weapon'];

export const flyingVehicle: RawVehicleClass[] = ['heli', 'plane'];

export const secondsInFrame = 5;
