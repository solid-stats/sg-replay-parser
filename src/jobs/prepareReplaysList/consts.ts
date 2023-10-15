import path from 'path';

import { configDir } from '../../0 - utils/dirs';

export const includeReplaysPath = path.join(configDir, 'includeReplays.json');

export const excludeReplaysPath = path.join(configDir, 'excludeReplays.json');

export const defaultEmptyOutput: Output = {
  parsedReplays: [],
  replays: [],
  problematicReplays: [],
};
