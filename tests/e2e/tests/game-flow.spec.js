import { test, expect } from '../fixtures.js';

test.describe('Cribbage Game Flow', () => {
  test('Player can create account with nickname', async ({ page, apiClient }) => {
    const player = await apiClient.createPlayer('TestPlayer1');
    
    expect(player).toHaveProperty('uuid');
    expect(player).toHaveProperty('nickname');
    expect(player.nickname).toBe('TestPlayer1');
    expect(player).toHaveProperty('created_at');
  });

  test('Player can retrieve their stats', async ({ apiClient }) => {
    const player = await apiClient.createPlayer('StatPlayer');
    const stats = await apiClient.getPlayerStats(player.uuid);
    
    expect(stats).toHaveProperty('uuid');
    expect(stats).toHaveProperty('total_games');
    expect(stats).toHaveProperty('wins');
    expect(stats).toHaveProperty('losses');
    expect(stats.total_games).toBe(0);
  });

  test('Player can create a new game', async ({ apiClient }) => {
    const player = await apiClient.createPlayer('GameCreator');
    const game = await apiClient.createGame(player.uuid);
    
    expect(game).toHaveProperty('game_code');
    expect(game).toHaveProperty('player1_uuid');
    expect(game.player1_uuid).toBe(player.uuid);
    expect(game.game_code).toMatch(/^CRIB-[A-Z0-9]{6}$/);
  });

  test('Second player can join existing game with valid code', async ({ apiClient }) => {
    const player1 = await apiClient.createPlayer('Player1');
    const player2 = await apiClient.createPlayer('Player2');
    const game = await apiClient.createGame(player1.uuid);
    
    const joinResult = await apiClient.joinGame(game.game_code, player2.uuid);
    
    expect(joinResult).toHaveProperty('player2_uuid');
    expect(joinResult.player2_uuid).toBe(player2.uuid);
  });

  test('Invalid game code returns error', async ({ apiClient, page }) => {
    const player = await apiClient.createPlayer('TestPlayer');
    
    try {
      await apiClient.joinGame('INVALID-CODE', player.uuid);
      throw new Error('Should have thrown error');
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });

  test('Welcome screen renders correctly', async ({ page }) => {
    await page.goto('/');
    
    const heading = await page.locator('h1');
    await expect(heading).toBeVisible();
    
    const createButton = await page.locator('button:has-text("Create Game")');
    await expect(createButton).toBeVisible();
    
    const joinButton = await page.locator('button:has-text("Join Game")');
    await expect(joinButton).toBeVisible();
  });

  test('Nickname input accepts valid names', async ({ page }) => {
    await page.goto('/');
    
    const nicknameInput = await page.locator('input[placeholder*="nick" i]');
    await nicknameInput.fill('TestNickname');
    
    const value = await nicknameInput.inputValue();
    expect(value).toBe('TestNickname');
  });

  test('Create game button triggers game creation flow', async ({ page, apiClient }) => {
    await page.goto('/');
    
    const nicknameInput = await page.locator('input[placeholder*="nick" i]');
    await nicknameInput.fill('GameCreator');
    
    const createButton = await page.locator('button:has-text("Create Game")');
    await createButton.click();
    
    // Wait for game code display
    await page.waitForTimeout(1000);
    const gameCode = await page.locator('[data-testid="game-code"]').textContent();
    expect(gameCode).toMatch(/^CRIB-[A-Z0-9]{6}$/);
  });

  test('Join game flow works with valid code', async ({ page }) => {
    await page.goto('/');
    
    const nicknameInput = await page.locator('input[placeholder*="nick" i]');
    await nicknameInput.fill('JoiningPlayer');
    
    const joinButton = await page.locator('button:has-text("Join Game")');
    await joinButton.click();
    
    // Wait for join dialog
    await page.waitForTimeout(500);
    const codeInput = await page.locator('input[placeholder*="code" i]');
    await expect(codeInput).toBeVisible();
  });
});
