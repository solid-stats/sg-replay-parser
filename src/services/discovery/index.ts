export {
  fetchReplaysPage,
  fetchMultiplePages,
  parseReplaysPage,
  extractReplayId,
  parseDateFromId,
} from './fetchReplays';

export {
  discoverNewReplays,
  discoverNewReplayLinks,
  getKnownReplayIds,
  filterNewReplays,
} from './discoverNewReplays';

export {
  saveNewReplay,
  saveNewReplays,
  parseGameType,
  getNormalizedMissionName,
} from './saveNewReplay';

export {
  discoverAndSaveReplays,
  quickDiscovery,
  fullDiscovery,
} from './discoverAndSave';

export type {
  ReplayLink,
  FetchReplaysPageResult,
  DiscoverOptions,
} from './types';

export type {
  SaveReplayResult,
  BatchSaveResult,
  IncludeReplayConfig,
} from './saveNewReplay';

export type {
  DiscoverAndSaveOptions,
  DiscoverAndSaveResult,
} from './discoverAndSave';
