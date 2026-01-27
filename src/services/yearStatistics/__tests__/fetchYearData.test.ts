/**
 * Tests for fetchYearData service
 * TDD: Write tests first, then implement
 */

import { getDbClient } from '../../../db/client';

import { fetchYearReplays, aggregatePlayerStats } from '../fetchYearData';
import type { YearReplay, PlayerYearStats } from '../types';

// Mock the database client
jest.mock('../../../db/client');

const mockDbClient = {
  replay: {
    findMany: jest.fn(),
  },
  playerReplayResult: {
    groupBy: jest.fn(),
  },
};

(getDbClient as jest.Mock).mockReturnValue(mockDbClient);

describe('fetchYearData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchYearReplays', () => {
    it('should fetch replays for a specific year', async () => {
      const mockReplays = [
        {
          id: 'replay-1',
          filename: '2025_06_15__12_30_00_ocap.json',
          date: new Date('2025-06-15'),
          missionName: 'TestMission',
          status: 'PARSED',
          playerResults: [
            {
              playerId: 'player-1',
              entityName: 'TestPlayer',
              kills: 5,
              deaths: 2,
              teamkills: 0,
              deathsByTeamkills: 0,
              player: {
                id: 'player-1',
                names: [{ name: 'TestPlayer' }],
              },
            },
          ],
        },
      ];

      mockDbClient.replay.findMany.mockResolvedValue(mockReplays);

      const result = await fetchYearReplays(2025);

      expect(mockDbClient.replay.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            date: {
              gte: new Date('2025-01-01T00:00:00.000Z'),
              lte: new Date('2025-12-31T23:59:59.999Z'),
            },
            status: 'PARSED',
          },
        }),
      );

      expect(result).toHaveLength(1);
      expect(result[0].replayId).toBe('2025_06_15__12_30_00_ocap.json');
    });

    it('should transform replay data to YearReplay format', async () => {
      const mockReplays = [
        {
          id: 'replay-1',
          replayId: '123456',
          date: new Date('2025-06-15'),
          missionName: 'TestMission',
          worldName: 'Altis',
          filePath: '/path/to/replay.json',
          playerResults: [
            {
              playerId: 'player-1',
              entityName: 'TestPlayer',
              kills: 5,
              deaths: 2,
              teamkills: 1,
              deathsByTeamkills: 0,
              player: { id: 'player-1', currentName: 'TestPlayer' },
            },
          ],
        },
      ];

      mockDbClient.replay.findMany.mockResolvedValue(mockReplays);

      const result = await fetchYearReplays(2025);

      const replay: YearReplay = result[0];

      expect(replay.playerResults[0]).toEqual({
        playerId: 'player-1',
        playerName: 'TestPlayer',
        kills: 5,
        deaths: 2,
        teamkills: 1,
        deathsByTeamkills: 0,
      });
    });

    it('should return empty array if no replays found', async () => {
      mockDbClient.replay.findMany.mockResolvedValue([]);

      const result = await fetchYearReplays(2025);

      expect(result).toEqual([]);
    });
  });

  describe('aggregatePlayerStats', () => {
    it('should aggregate player stats from replays', () => {
      const replays: YearReplay[] = [
        {
          id: 'replay-1',
          replayId: '123',
          date: new Date('2025-01-15'),
          missionName: 'Mission1',
          worldName: 'Altis',
          filePath: '/path/1.json',
          playerResults: [
            {
              playerId: 'player-1',
              playerName: 'Player1',
              kills: 5,
              deaths: 2,
              teamkills: 1,
              deathsByTeamkills: 0,
            },
            {
              playerId: 'player-2',
              playerName: 'Player2',
              kills: 3,
              deaths: 4,
              teamkills: 0,
              deathsByTeamkills: 1,
            },
          ],
        },
        {
          id: 'replay-2',
          replayId: '456',
          date: new Date('2025-02-20'),
          missionName: 'Mission2',
          worldName: 'Tanoa',
          filePath: '/path/2.json',
          playerResults: [
            {
              playerId: 'player-1',
              playerName: 'Player1',
              kills: 10,
              deaths: 1,
              teamkills: 0,
              deathsByTeamkills: 0,
            },
          ],
        },
      ];

      const stats = aggregatePlayerStats(replays);

      expect(stats.size).toBe(2);

      const player1Stats = stats.get('player-1');

      expect(player1Stats).toEqual({
        playerId: 'player-1',
        playerName: 'Player1',
        totalKills: 15,
        totalDeaths: 3,
        totalGames: 2,
        teamkills: 1,
        deathsByTeamkills: 0,
        score: expect.any(Number),
      });

      const player2Stats = stats.get('player-2');

      expect(player2Stats).toEqual({
        playerId: 'player-2',
        playerName: 'Player2',
        totalKills: 3,
        totalDeaths: 4,
        totalGames: 1,
        teamkills: 0,
        deathsByTeamkills: 1,
        score: expect.any(Number),
      });
    });

    it('should return empty map for empty replays', () => {
      const stats = aggregatePlayerStats([]);

      expect(stats.size).toBe(0);
    });
  });
});
