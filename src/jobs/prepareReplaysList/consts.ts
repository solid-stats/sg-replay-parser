import path from 'path';

import { configPath } from '../../shared/utils/paths';

export const includeReplaysPath = path.join(configPath, 'includeReplays.json');

export const excludeReplaysPath = path.join(configPath, 'excludeReplays.json');

export const defaultEmptyOutput: Output = {
  parsedReplays: [],
  replays: [],
  problematicReplays: [],
};
