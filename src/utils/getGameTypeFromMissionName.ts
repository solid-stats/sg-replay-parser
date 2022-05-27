// mission name examples:
// sg@189_bob_cossac_mace_v7
// mace@15_mik_random_v6fixfix
const getGameTypeFromMissionName = (missionName: Replay['mission_name']): GameType => (
  missionName.split('@')[0] as GameType
);

export default getGameTypeFromMissionName;
