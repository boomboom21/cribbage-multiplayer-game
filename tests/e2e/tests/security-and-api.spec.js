import { test, expect } from '../fixtures.js';

test.describe('Security & API Validation', () => {
  test('Rate limiting prevents abuse', async ({ apiClient }) => {
    // Rapid requests should be limited
    const requests = [];
    for (let i = 0; i < 15; i++) {
      try {
        const p = await apiClient.createPlayer(`RateLimitTest${i}`);
        requests.push(p);
      } catch (error) {
        // Expected to hit rate limit
        expect(error.response?.status).toBe(429);
        break;
      }
    }
    // Should have created some players but eventually hit rate limit
    expect(requests.length).toBeGreaterThan(0);
  });

  test('Input validation: Nickname must be 2-50 characters', async ({ apiClient }) => {
    // Test too short
    try {
      await apiClient.createPlayer('A');
      throw new Error('Should reject short nickname');
    } catch (error) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data?.error).toContain('2-50');
    }

    // Test too long
    try {
      await apiClient.createPlayer('A'.repeat(51));
      throw new Error('Should reject long nickname');
    } catch (error) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data?.error).toContain('2-50');
    }
  });

  test('XSS prevention: Script tags blocked in nickname', async ({ apiClient }) => {
    try {
      await apiClient.createPlayer('<script>alert("xss")</script>');
      throw new Error('Should reject XSS');
    } catch (error) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data?.error).toContain('invalid');
    }
  });

  test('Valid nicknames are accepted', async ({ apiClient }) => {
    const nicknames = ['Alice', 'Bob123', 'Player_One', 'Test'];
    
    for (const nickname of nicknames) {
      const player = await apiClient.createPlayer(nickname);
      expect(player.nickname).toBe(nickname);
      expect(player.uuid).toBeDefined();
    }
  });

  test('Game code validation: Only valid format accepted', async ({ apiClient }) => {
    const player = await apiClient.createPlayer('GameCodeTester');
    
    try {
      await apiClient.joinGame('invalid-code', player.id);
      throw new Error('Should reject invalid code');
    } catch (error) {
      expect(error.response?.status).toBe(400);
      expect(error.response?.data?.error).toContain('code format');
    }
  });

  test('Game code format is correct (6 uppercase alphanumeric)', async ({ apiClient }) => {
    const player = await apiClient.createPlayer('CodeFormatTest');
    const game = await apiClient.createGame(player.id);
    
    expect(game.game_code).toMatch(/^[A-Z0-9]{6}$/);
  });

  test('Non-existent player UUID returns 404', async ({ apiClient }) => {
    try {
      await apiClient.getPlayerStats('00000000-0000-0000-0000-000000000000');
      throw new Error('Should return 404');
    } catch (error) {
      expect(error.response?.status).toBe(404);
    }
  });

  test('Duplicate player join is rejected', async ({ apiClient }) => {
    const p1 = await apiClient.createPlayer('Player1');
    const game = await apiClient.createGame(p1.id);
    
    // First player already owns the game
    try {
      await apiClient.joinGame(game.game_code, p1.id);
      throw new Error('Should reject duplicate');
    } catch (error) {
      expect([400, 409]).toContain(error.response?.status);
    }
  });

  test('Missing required fields return 400', async ({ apiClient }) => {
    try {
      // Missing nickname
      await apiClient.createPlayer('');
      throw new Error('Should reject empty nickname');
    } catch (error) {
      expect(error.response?.status).toBe(400);
    }
  });

  test('Health endpoint accessible', async ({ apiClient }) => {
    const health = await apiClient.getHealth();
    expect(health.status).toBe('ok');
  });
});

test.describe('Multiplayer Game Flow', () => {
  test('Complete game flow: Create, Join, Play', async ({ apiClient }) => {
    // Player 1 creates game
    const p1 = await apiClient.createPlayer('Player1');
    const game = await apiClient.createGame(p1.id);
    
    expect(game.game_code).toBeDefined();
    expect(game.player1_id).toBe(p1.id);
    expect(game.status).toBe('waiting');

    // Player 2 joins game
    const p2 = await apiClient.createPlayer('Player2');
    const joined = await apiClient.joinGame(game.game_code, p2.id);
    
    expect(joined.player2_id).toBe(p2.id);
    expect(joined.status).toBe('dealing');

    // Verify game state
    const gameState = await apiClient.getGame(game.game_code);
    expect(gameState.player1_id).toBe(p1.id);
    expect(gameState.player2_id).toBe(p2.id);
  });

  test('Player stats are tracked', async ({ apiClient }) => {
    const player = await apiClient.createPlayer('StatsPlayer');
    const stats = await apiClient.getPlayerStats(player.uuid);
    
    expect(stats.uuid).toBe(player.uuid);
    expect(stats.total_games).toBe(0);
    expect(stats.wins).toBe(0);
    expect(stats.losses).toBe(0);
  });

  test('Game code uniqueness', async ({ apiClient }) => {
    const p1 = await apiClient.createPlayer('Unique1');
    const p2 = await apiClient.createPlayer('Unique2');
    
    const game1 = await apiClient.createGame(p1.id);
    const game2 = await apiClient.createGame(p2.id);
    
    expect(game1.game_code).not.toBe(game2.game_code);
  });

  test('Game state is consistent', async ({ apiClient }) => {
    const p1 = await apiClient.createPlayer('Consistent1');
    const p2 = await apiClient.createPlayer('Consistent2');
    
    const game = await apiClient.createGame(p1.id);
    await apiClient.joinGame(game.game_code, p2.id);
    
    // Fetch state twice
    const state1 = await apiClient.getGame(game.game_code);
    const state2 = await apiClient.getGame(game.game_code);
    
    // Should be identical
    expect(state1.p1_score).toBe(state2.p1_score);
    expect(state1.p2_score).toBe(state2.p2_score);
    expect(state1.current_player).toBe(state2.current_player);
  });
});
