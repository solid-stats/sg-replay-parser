import { defaultName } from '../consts';

const generateReplayInfo = (
  events: ReplayInfo['events'],
  entities: ReplayInfo['entities'],
): ReplayInfo => ({
  playersCount: [74, 0, 85, 0],
  endFrame: 800,
  captureDelay: 5,
  events,
  entities,
  EditorMarkers: [],
  Markers: [],
  missionAuthor: defaultName,
  missionName: defaultName,
  worldName: 'unknown',
});

export default generateReplayInfo;
