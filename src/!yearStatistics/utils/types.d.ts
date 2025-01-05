type Default = {
  id: PlayerId;
  name: PlayerName;
};
type DefaultCountNomination = Default & {
  count: number;
};
type DefaultDistanceNomination = Default & {
  distance: number;
};
type DefaultTimeNomination = Default & {
  // dd:hh:mm:ss
  time: `${string}${string}:${string}${string}:${string}${string}:${string}${string}`;
  timeInSeconds: number;
};

type DeathToGamesRatio = Default & {
  totalPlayedGames: TotalPlayedGames;
  deaths: Deaths['total'];
  ratio: number;
};

type MostTeamkillsInOneGame = DefaultCountNomination & {
  link: string;
};

type MostShots = DefaultCountNomination & {
  gamesCountWithAtleastOneShot: number;
};

type MostKillsFromOldWeapons = DefaultCountNomination & {
  weapons: Record<string, number>;
};

type BestMission = DefaultCountNomination & {
  lastPlayedDate: Replay['date'];
  map: Replay['world_name'];
};

type MostDisconnects = DefaultCountNomination & {
  gamesWithAtleastOneDisconnect: number;
};

type MostFrequentCommander = DefaultCountNomination & {
  frequency: string;
};

type MostDistantKill = {
  playerId: PlayerId;
  weaponName: string;
  playerName: PlayerName;
  maxDistance: number;
  roleDescription: string;
  replayLink: string;
  replayTime: string;
};

type MostATKills = {
  playerId: PlayerId;
  playerName: string;
  playersKilled: number;
  vehiclesKilled: number;
  maxDistance: number;
  total: number;
};

type MostHeight = {
  height: number;
  playedId: PlayerId;
  playerName: PlayerName;
  vehicleName: string;
};

type MostPlaneKillsFromPlane = DefaultCountNomination & {
  lastReplayDate: string;
  lastTime: number;
};

type KillsFromSlot = DefaultCountNomination & {
  totalSlotCount: number;
  slotFrequency: number;
};

type RandomshikNominee = DefaultDistanceNomination & {
  kills: number;
  coef: number;
};

type MostKillsWithSmallWalkedDistance = DefaultCountNomination & {
  minDistance: number;
};

type NomineeList<ValueType> = Record<string, ValueType>;

type WholeYearStatisticsResult = {
  bestDeathToGamesRatio: DeathToGamesRatio[];
  bestRandomshik: RandomshikNominee[];
  worstDeathToGamesRatio: DeathToGamesRatio[];
  mostTeamkillsInOneGame: MostTeamkillsInOneGame[];
  mostTeamkills: DefaultCountNomination[];
  mostShots: MostShots[];
  mostPopularMission: BestMission[];
  mostPopularMissionMaker: DefaultCountNomination[];
  mostDisconnects: MostDisconnects[];
  // CS = Comander of the Side
  mostFrequentCS: DefaultCountNomination[];
  // TL = Team Leader
  mostFrequentTL: DefaultCountNomination[];
  mostKillsFromCommanderSlot: KillsFromSlot[];
  mostKillsFromMedicSlot: KillsFromSlot[];
  mostDistantKill: MostDistantKill[];
  bestWeapon: DefaultCountNomination[];
  bestVehicle: DefaultCountNomination[];
  mostKillsFromOldWeapons: MostKillsFromOldWeapons[];
  mostATKills: MostATKills[];
  mostAAKills: DefaultCountNomination[];
  mostWalkedDistance: DefaultDistanceNomination[];
  mostDistanceInVehicle: DefaultDistanceNomination[];
  mostHeightPlane: MostHeight[];
  mostHeightHeli: MostHeight[];
  mostTimeAlive: DefaultTimeNomination[];
  mostTimeWalked: DefaultTimeNomination[];
  mostTimeInVehicle: DefaultTimeNomination[];
  mostTimeInGroundVehicle: DefaultTimeNomination[];
  mostTimeInFlyingVehicle: DefaultTimeNomination[];
  mostDeathsFromTeamkills: DefaultCountNomination[];
  mostKillsInCQB: DefaultCountNomination[];
  mostPlaneKillsFromPlane: MostPlaneKillsFromPlane[];
  mostKillsWithSmallWalkedDistance: MostKillsWithSmallWalkedDistance[];
};

type YearResultsInfo = {
  replays: Replay[];
  parsedReplays: PlayersGameResult[];
  globalStatistics: GlobalPlayerStatistics[];
  result: WholeYearStatisticsResult;
};

type InfoForRawReplayProcess = {
  replay: Replay;
  replayInfo: ReplayInfo;
  result: WholeYearStatisticsResult;
  globalStatistics: GlobalPlayerStatistics[];
};

type YearStatisticsKeys = keyof WholeYearStatisticsResult;
type NominationsOrder = Array<YearStatisticsKeys | YearStatisticsKeys[]>;
