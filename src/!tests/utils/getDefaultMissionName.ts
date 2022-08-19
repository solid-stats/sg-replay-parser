import { defaultName } from './consts';

const getDefaultMissionName = (gameType?: GameType) => `${gameType || 'sg'}@${defaultName}`;

export default getDefaultMissionName;
