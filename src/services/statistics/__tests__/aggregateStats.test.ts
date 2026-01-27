import { aggregatePlayerStats, aggregateAllPlayersStats } from '../aggregateStats';
import type { PlayerResultFromDB } from '../types';

describe('aggregateStats', () => {
  const createMockResult = (
    overrides: Partial<PlayerResultFromDB> = {},
  ): PlayerResultFromDB => ({
    id: 'result-1',
    replayId: 'replay-1',
    playerId: 'player-1',
    entityName: 'TestPlayer',
    squadPrefix: null,
    kills: 5,
    killsFromVehicle: 1,
    vehicleKills: 0,
    teamkills: 0,
    deaths: 1,
    deathsByTeamkills: 0,
    isDead: true,
    isDeadByTeamkill: false,
    score: 5,
    weapons: JSON.stringify([{ name: 'AK-74', kills: 3, maxDistance: 150 }]),
    vehicles: JSON.stringify([]),
    killed: JSON.stringify([{ id: 'player-2', name: 'Enemy1', count: 2 }]),
    killers: JSON.stringify([{ id: 'player-3', name: 'Enemy2', count: 1 }]),
    teamkilled: JSON.stringify([]),
    teamkillers: JSON.stringify([]),
    replay: {
      date: new Date('2024-01-15T18:00:00Z'),
      gameType: 'SG',
      missionName: 'test_mission',
    },
    ...overrides,
  });

  describe('aggregatePlayerStats', () => {
    it('should return null for empty results', () => {
      const result = aggregatePlayerStats([]);

      expect(result).toBeNull();
    });

    it('should aggregate single game result correctly', () => {
      const mockResult = createMockResult();
      const result = aggregatePlayerStats([mockResult]);

      expect(result).not.toBeNull();
      expect(result!.playerId).toBe('player-1');
      expect(result!.name).toBe('TestPlayer');
      expect(result!.totalPlayedGames).toBe(1);
      expect(result!.kills).toBe(5);
      expect(result!.killsFromVehicle).toBe(1);
      expect(result!.deathsTotal).toBe(1);
      expect(result!.deathsByTeamkills).toBe(0);
    });

    it('should aggregate multiple game results correctly', () => {
      const results: PlayerResultFromDB[] = [
        createMockResult({
          id: 'result-1',
          kills: 5,
          killsFromVehicle: 1,
          teamkills: 0,
          isDead: true,
          isDeadByTeamkill: false,
          replay: { date: new Date('2024-01-15T18:00:00Z'), gameType: 'SG', missionName: 'mission1' },
        }),
        createMockResult({
          id: 'result-2',
          kills: 3,
          killsFromVehicle: 2,
          teamkills: 1,
          isDead: false,
          isDeadByTeamkill: false,
          replay: { date: new Date('2024-01-16T18:00:00Z'), gameType: 'SG', missionName: 'mission2' },
        }),
        createMockResult({
          id: 'result-3',
          kills: 7,
          killsFromVehicle: 0,
          teamkills: 0,
          isDead: true,
          isDeadByTeamkill: true,
          replay: { date: new Date('2024-01-17T18:00:00Z'), gameType: 'SG', missionName: 'mission3' },
        }),
      ];

      const result = aggregatePlayerStats(results);

      expect(result).not.toBeNull();
      expect(result!.totalPlayedGames).toBe(3);
      expect(result!.kills).toBe(15); // 5 + 3 + 7
      expect(result!.killsFromVehicle).toBe(3); // 1 + 2 + 0
      expect(result!.teamkills).toBe(1);
      expect(result!.deathsTotal).toBe(2); // first and third games
      expect(result!.deathsByTeamkills).toBe(1); // third game only
    });

    it('should calculate KD ratio correctly', () => {
      const results: PlayerResultFromDB[] = [
        createMockResult({
          kills: 10,
          teamkills: 2,
          isDead: true,
          isDeadByTeamkill: false,
        }),
        createMockResult({
          kills: 5,
          teamkills: 1,
          isDead: true,
          isDeadByTeamkill: false,
          replay: { date: new Date('2024-01-16T18:00:00Z'), gameType: 'SG', missionName: 'mission2' },
        }),
      ];

      const result = aggregatePlayerStats(results);

      // kills = 15, teamkills = 3, deaths = 2, deathsByTeamkills = 0
      // KD = (15 - 3) / (2 - 0) = 6
      expect(result!.kdRatio).toBe(6);
    });

    it('should merge weapons statistics', () => {
      const results: PlayerResultFromDB[] = [
        createMockResult({
          weapons: JSON.stringify([
            { name: 'AK-74', kills: 3, maxDistance: 150 },
            { name: 'M4A1', kills: 2, maxDistance: 200 },
          ]),
        }),
        createMockResult({
          weapons: JSON.stringify([
            { name: 'AK-74', kills: 5, maxDistance: 180 },
            { name: 'SVD', kills: 1, maxDistance: 500 },
          ]),
          replay: { date: new Date('2024-01-16T18:00:00Z'), gameType: 'SG', missionName: 'mission2' },
        }),
      ];

      const result = aggregatePlayerStats(results);

      expect(result!.weapons.length).toBe(3);
      const ak = result!.weapons.find((w) => w.name === 'AK-74');

      expect(ak).toBeDefined();
      expect(ak!.kills).toBe(8); // 3 + 5
      expect(ak!.maxDistance).toBe(180); // max of 150 and 180
    });

    it('should limit weapons to top 25', () => {
      const weapons = Array.from({ length: 30 }, (_, i) => ({
        name: `Weapon${i}`,
        kills: 30 - i,
        maxDistance: 100,
      }));

      const result = aggregatePlayerStats([
        createMockResult({
          weapons: JSON.stringify(weapons),
        }),
      ]);

      expect(result!.weapons.length).toBe(25);
      expect(result!.weapons[0].name).toBe('Weapon0');
      expect(result!.weapons[24].name).toBe('Weapon24');
    });

    it('should merge other players (killed, killers)', () => {
      const results: PlayerResultFromDB[] = [
        createMockResult({
          killed: JSON.stringify([
            { id: 'enemy1', name: 'Enemy1', count: 2 },
            { id: 'enemy2', name: 'Enemy2', count: 1 },
          ]),
        }),
        createMockResult({
          killed: JSON.stringify([
            { id: 'enemy1', name: 'Enemy1', count: 3 },
            { id: 'enemy3', name: 'Enemy3', count: 1 },
          ]),
          replay: { date: new Date('2024-01-16T18:00:00Z'), gameType: 'SG', missionName: 'mission2' },
        }),
      ];

      const result = aggregatePlayerStats(results);

      const enemy1 = result!.killed.find((k) => k.id === 'enemy1');

      expect(enemy1).toBeDefined();
      expect(enemy1!.count).toBe(5); // 2 + 3
      expect(result!.killed.length).toBe(3);
    });

    it('should limit interactions to top 10', () => {
      const killed = Array.from({ length: 15 }, (_, i) => ({
        id: `enemy${i}`,
        name: `Enemy${i}`,
        count: 15 - i,
      }));

      const result = aggregatePlayerStats([
        createMockResult({
          killed: JSON.stringify(killed),
        }),
      ]);

      expect(result!.killed.length).toBe(10);
    });

    it('should group results by week', () => {
      const results: PlayerResultFromDB[] = [
        createMockResult({
          kills: 5,
          replay: { date: new Date('2024-01-15T18:00:00Z'), gameType: 'SG', missionName: 'mission1' },
        }),
        createMockResult({
          kills: 3,
          replay: { date: new Date('2024-01-16T18:00:00Z'), gameType: 'SG', missionName: 'mission2' },
        }),
        createMockResult({
          kills: 10,
          replay: { date: new Date('2024-01-22T18:00:00Z'), gameType: 'SG', missionName: 'mission3' },
        }),
      ];

      const result = aggregatePlayerStats(results);

      expect(result!.byWeeks.length).toBe(2);
      // Week 03 of 2024 (Jan 15-16)
      const week03 = result!.byWeeks.find((w) => w.week === '2024-03');

      expect(week03).toBeDefined();
      expect(week03!.totalPlayedGames).toBe(2);
      expect(week03!.kills).toBe(8); // 5 + 3
    });

    it('should use last game values for name and prefix', () => {
      const results: PlayerResultFromDB[] = [
        createMockResult({
          entityName: 'OldName',
          squadPrefix: null,
          replay: { date: new Date('2024-01-15T18:00:00Z'), gameType: 'SG', missionName: 'mission1' },
        }),
        createMockResult({
          entityName: 'NewName',
          squadPrefix: 'SG@',
          replay: { date: new Date('2024-01-20T18:00:00Z'), gameType: 'SG', missionName: 'mission2' },
        }),
      ];

      const result = aggregatePlayerStats(results);

      expect(result!.name).toBe('NewName');
      expect(result!.lastSquadPrefix).toBe('SG@');
    });
  });

  describe('aggregateAllPlayersStats', () => {
    it('should aggregate stats for multiple players', () => {
      const resultsByPlayer = new Map<string, PlayerResultFromDB[]>();

      resultsByPlayer.set('player-1', [
        createMockResult({ playerId: 'player-1', entityName: 'Player1', kills: 10 }),
      ]);
      resultsByPlayer.set('player-2', [
        createMockResult({ playerId: 'player-2', entityName: 'Player2', kills: 20 }),
      ]);

      const results = aggregateAllPlayersStats(resultsByPlayer);

      expect(results.length).toBe(2);
      // Should be sorted by score
      expect(results[0].name).toBe('Player2'); // Higher kills = higher score
      expect(results[1].name).toBe('Player1');
    });

    it('should handle empty map', () => {
      const results = aggregateAllPlayersStats(new Map());

      expect(results).toEqual([]);
    });
  });
});
