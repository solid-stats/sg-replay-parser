import { configFolderName } from '../0 - consts';

export const includeReplaysPath = `${configFolderName}/includeReplays.json`;

export const excludeReplaysPath = `${configFolderName}/excludeReplays.json`;

export const defaultEmptyOutput: Output = {
  parsedReplays: [],
  replays: [],
  problematicReplays: [],
};
