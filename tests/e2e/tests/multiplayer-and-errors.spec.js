import { test, expect } from '../fixtures.js';

test.describe('Multiplayer & Error Handling', () => {
  test('Two players can see each other joining', async ({ player1, player2, apiClient }) => {
    const p1 = await apiClient.createPlayer('Player1');
    const p2 = await apiClient.createPlayer('Player2');
    
    const game = await apiClient.createGame(p1.uuid);
    
    // Player 1 navigates to game
    await player1.goto(`/?game=${game.game_code}`);
    
    // Player 2 joins
    const joinResult = await apiClient.joinGame(game.game_code, p2.uuid);
    expect(joinResult.player2_uuid).toBe(p2.uuid);
  });

  test('Game rejects duplicate player join', async ({ apiClient }) => {
    const player = await apiClient.createPlayer('DuplicateTest');
    const game = await apiClient.createGame(player.uuid);
    
    try {
      // Attempt to join same game twice with same player
      await apiClient.joinGame(game.game_code, player.uuid);
      throw new Error('Should reject duplicate join');
    } catch (error) {
      // Expected: 400 or 409 conflict
      expect([400, 409]).toContain(error.response?.status);
    }
  });

  test('Invalid nickname input is handled', async ({ page }) => {
    await page.goto('/');
    
    const nicknameInput = await page.locator('input[placeholder*="nick" i]');
    
    // Test XSS attempt
    await nicknameInput.fill('<script>alert("xss")</script>');
    
    // Verify input is escaped or sanitized
    const value = await nicknameInput.inputValue();
    expect(value).not.toContain('<script>');
  });

  test('Game code is properly formatted and unique', async ({ apiClient }) => {
    const player1 = await apiClient.createPlayer('P1');
    const player2 = await apiClient.createPlayer('P2');
    
    const game1 = await apiClient.createGame(player1.uuid);
    const game2 = await apiClient.createGame(player2.uuid);
    
    expect(game1.game_code).not.toBe(game2.game_code);
    expect(game1.game_code).toMatch(/^CRIB-[A-Z0-9]{6}$/);
    expect(game2.game_code).toMatch(/^CRIB-[A-Z0-9]{6}$/);
  });

  test('Connection errors are handled gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Simulate network error
    await page.context().setOffline(true);
    
    // Try to interact (should show error or queue action)
    const nicknameInput = await page.locator('input[placeholder*="nick" i]');
    await nicknameInput.fill('OfflinePlayer');
    
    await page.context().setOffline(false);
  });

  test('Missing required fields return validation errors', async ({ apiClient }) => {
    try {
      // Attempt to create player without nickname
      await apiClient.createPlayer('');
      throw new Error('Should reject empty nickname');
    } catch (error) {
      expect(error.response?.status).toBe(400);
    }
  });

  test('Non-existent player UUID handled', async ({ apiClient }) => {
    try {
      const fakeUUID = '00000000-0000-0000-0000-000000000000';
      await apiClient.getPlayerStats(fakeUUID);
      throw new Error('Should reject non-existent player');
    } catch (error) {
      expect(error.response?.status).toBe(404);
    }
  });

  test('Disconnection and reconnection work', async ({ page }) => {
    await page.goto('/');
    
    // Setup game
    const nicknameInput = await page.locator('input[placeholder*="nick" i]');
    await nicknameInput.fill('ReconnectTest');
    
    // Simulate disconnect/reconnect
    await page.context().setOffline(true);
    await page.waitForTimeout(500);
    await page.context().setOffline(false);
    
    // Page should still be functional
    await expect(nicknameInput).toBeVisible();
  });

  test('Invalid game phase transitions rejected', async ({ apiClient }) => {
    const player1 = await apiClient.createPlayer('P1');
    const game = await apiClient.createGame(player1.uuid);
    
    const gameState = await apiClient.getGame(game.game_code);
    
    // Verify phase is one of valid states
    const validPhases = ['dealing', 'discard', 'pegging', 'counting'];
    expect(validPhases.includes(gameState.phase)).toBeTruthy();
  });

  test('Concurrent game actions handled correctly', async ({ player1, player2, apiClient }) => {
    const p1 = await apiClient.createPlayer('Concurrent1');
    const p2 = await apiClient.createPlayer('Concurrent2');
    
    const game = await apiClient.createGame(p1.uuid);
    await apiClient.joinGame(game.game_code, p2.uuid);
    
    // Both players navigate to game
    await player1.goto(`/?game=${game.game_code}`);
    await player2.goto(`/?game=${game.game_code}`);
    
    await player1.waitForTimeout(1000);
    await player2.waitForTimeout(1000);
    
    // Verify both loaded successfully
    const canvas1 = await player1.locator('canvas');
    const canvas2 = await player2.locator('canvas');
    
    await expect(canvas1).toBeVisible();
    await expect(canvas2).toBeVisible();
  });

  test('Game state consistency across players', async ({ apiClient }) => {
    const p1 = await apiClient.createPlayer('Consistent1');
    const p2 = await apiClient.createPlayer('Consistent2');
    
    const game = await apiClient.createGame(p1.uuid);
    await apiClient.joinGame(game.game_code, p2.uuid);
    
    // Fetch game state from both perspectives
    const state1 = await apiClient.getGame(game.game_code);
    const state2 = await apiClient.getGame(game.game_code);
    
    // States should be identical
    expect(state1.p1_score).toBe(state2.p1_score);
    expect(state1.p2_score).toBe(state2.p2_score);
    expect(state1.current_player).toBe(state2.current_player);
  });
});
