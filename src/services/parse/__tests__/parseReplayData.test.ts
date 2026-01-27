import fs from 'fs-extra';

import {
  readReplayFile,
  extractSquadPrefix,
  convertPlayerInfo,
  parseReplayData,
} from '../parseReplayData';

jest.mock('fs-extra');
jest.mock('../../../shared/utils/paths', () => ({
  rawReplaysPath: '/mock/raw_replays',
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('parseReplayData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readReplayFile', () => {
    it('should read and parse JSON file', async () => {
      const mockReplayInfo: Partial<ReplayInfo> = {
        missionName: 'Test Mission',
        worldName: 'Altis',
        missionAuthor: 'TestAuthor',
        entities: [],
        events: [],
      };

      mockFs.pathExists.mockResolvedValue(true as never);
      mockFs.readJson.mockResolvedValue(mockReplayInfo as never);

      const result = await readReplayFile('test-replay');

      expect(mockFs.pathExists).toHaveBeenCalledWith('/mock/raw_replays/test-replay.json');
      expect(mockFs.readJson).toHaveBeenCalledWith('/mock/raw_replays/test-replay.json');
      expect(result).toEqual(mockReplayInfo);
    });

    it('should return null if file does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false as never);

      const result = await readReplayFile('missing-replay');

      expect(result).toBeNull();
      expect(mockFs.readJson).not.toHaveBeenCalled();
    });

    it('should return null on read error', async () => {
      mockFs.pathExists.mockResolvedValue(true as never);
      mockFs.readJson.mockRejectedValue(new Error('Read error') as never);

      const result = await readReplayFile('bad-replay');

      expect(result).toBeNull();
    });
  });

  describe('extractSquadPrefix', () => {
    it('should extract prefix from [TAG] format', () => {
      expect(extractSquadPrefix('[WOG] Player')).toBe('WOG');
      expect(extractSquadPrefix('[ABC] Test Name')).toBe('ABC');
    });

    it('should return null for names without prefix', () => {
      expect(extractSquadPrefix('Player')).toBeNull();
      expect(extractSquadPrefix('Test Name')).toBeNull();
    });

    it('should handle edge cases', () => {
      expect(extractSquadPrefix('')).toBeNull();
      expect(extractSquadPrefix('[] Player')).toBeNull(); // empty brackets don't match
      expect(extractSquadPrefix('[TAG]')).toBe('TAG');
      expect(extractSquadPrefix('Player [TAG]')).toBeNull(); // bracket not at start
    });

    it('should only extract first bracket pair', () => {
      expect(extractSquadPrefix('[A] [B] Player')).toBe('A');
    });
  });

  describe('convertPlayerInfo', () => {
    const mockPlayerInfo: PlayerInfo = {
      id: 1,
      name: '[WOG] TestPlayer',
      side: 'WEST',
      kills: 5,
      killsFromVehicle: 1,
      vehicleKills: 2,
      teamkills: 0,
      isDead: true,
      isDeadByTeamkill: false,
      weapons: [{ name: 'Rifle', kills: 3, maxDistance: 100 }],
      vehicles: [{ name: 'Tank', kills: 2, maxDistance: 500 }],
      killed: [{ id: 'p2', name: 'Enemy1', count: 1 }],
      killers: [{ id: 'p3', name: 'Enemy2', count: 1 }],
      teamkilled: [],
      teamkillers: [],
    };

    it('should convert PlayerInfo to ParsedPlayerResult', () => {
      const result = convertPlayerInfo(mockPlayerInfo);

      expect(result.entityName).toBe('TestPlayer');
      expect(result.squadPrefix).toBe('WOG');
      expect(result.kills).toBe(5);
      expect(result.killsFromVehicle).toBe(1);
      expect(result.vehicleKills).toBe(2);
      expect(result.teamkills).toBe(0);
      expect(result.isDead).toBe(true);
      expect(result.isDeadByTeamkill).toBe(false);
      expect(result.weapons).toEqual([{ name: 'Rifle', kills: 3, maxDistance: 100 }]);
      expect(result.vehicles).toEqual([{ name: 'Tank', kills: 2, maxDistance: 500 }]);
    });

    it('should handle player without squad prefix', () => {
      const playerWithoutPrefix: PlayerInfo = {
        ...mockPlayerInfo,
        name: 'PlainPlayer',
      };

      const result = convertPlayerInfo(playerWithoutPrefix);

      expect(result.entityName).toBe('PlainPlayer');
      expect(result.squadPrefix).toBeNull();
    });
  });

  describe('parseReplayData', () => {
    it('should return null when replay file does not exist', async () => {
      mockFs.pathExists.mockResolvedValue(false as never);

      const result = await parseReplayData('missing', new Date('2024-01-01'));

      expect(result).toBeNull();
    });

    it('should parse replay and return parsed result', async () => {
      const mockReplayInfo: ReplayInfo = {
        missionName: 'Test Mission',
        worldName: 'Altis',
        missionAuthor: 'Author',
        playersCount: [10, 12, 11],
        endFrame: 1000,
        captureDelay: 1,
        entities: [
          {
            id: 1,
            type: 'unit',
            name: '[WOG] Player1',
            description: 'Rifleman',
            isPlayer: 1,
            side: 'WEST',
            group: 'Alpha',
            positions: [],
            framesFired: [],
            startFrameNum: 0,
          } as PlayerEntity,
        ],
        events: [],
        EditorMarkers: [],
        Markers: [],
      };

      mockFs.pathExists.mockResolvedValue(true as never);
      mockFs.readJson.mockResolvedValue(mockReplayInfo as never);

      const result = await parseReplayData('test-replay', new Date('2024-01-01'));

      expect(result).not.toBeNull();
      expect(result?.missionName).toBe('Test Mission');
      expect(result?.worldName).toBe('Altis');
      expect(result?.missionAuthor).toBe('Author');
      expect(result?.players).toHaveLength(1);
      expect(result?.players[0].entityName).toBe('Player1');
    });
  });
});
