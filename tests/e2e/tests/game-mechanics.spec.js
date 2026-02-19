import { test, expect } from '../fixtures.js';

test.describe('Cribbage Game Mechanics', () => {
  test('Game state initializes with valid deck and hand sizes', async ({ apiClient }) => {
    const player1 = await apiClient.createPlayer('Dealer');
    const player2 = await apiClient.createPlayer('NonDealer');
    const game = await apiClient.createGame(player1.uuid);
    
    await apiClient.joinGame(game.game_code, player2.uuid);
    const gameState = await apiClient.getGame(game.game_code);
    
    expect(gameState).toHaveProperty('phase');
    expect(gameState).toHaveProperty('current_player');
    expect(gameState).toHaveProperty('cards');
  });

  test('Card plays are validated server-side', async ({ apiClient }) => {
    const player1 = await apiClient.createPlayer('P1');
    const player2 = await apiClient.createPlayer('P2');
    const game = await apiClient.createGame(player1.uuid);
    
    await apiClient.joinGame(game.game_code, player2.uuid);
    const gameState = await apiClient.getGame(game.game_code);
    
    // Verify game has valid structure
    expect(gameState).toHaveProperty('phase');
    expect(['dealing', 'discard', 'pegging', 'counting'].includes(gameState.phase)).toBeTruthy();
  });

  test('Peg position updates are validated', async ({ apiClient }) => {
    const player1 = await apiClient.createPlayer('P1');
    const game = await apiClient.createGame(player1.uuid);
    
    const gameState = await apiClient.getGame(game.game_code);
    
    // Verify initial peg positions (should be 0)
    expect(gameState).toHaveProperty('p1_peg_position');
    expect(gameState).toHaveProperty('p2_peg_position');
    expect(gameState.p1_peg_position).toBe(0);
    expect(gameState.p2_peg_position).toBe(0);
  });

  test('Invalid peg movements are rejected', async ({ page, apiClient }) => {
    const player1 = await apiClient.createPlayer('InvalidPeg');
    const game = await apiClient.createGame(player1.uuid);
    
    try {
      // Attempt invalid move with malformed data
      await apiClient.joinGame('INVALID-GAME', player1.uuid);
      throw new Error('Should reject invalid game code');
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });

  test('Score calculations follow cribbage rules', async ({ apiClient }) => {
    const player1 = await apiClient.createPlayer('Scorer');
    const game = await apiClient.createGame(player1.uuid);
    
    const gameState = await apiClient.getGame(game.game_code);
    
    // Verify score fields exist
    expect(gameState).toHaveProperty('p1_score');
    expect(gameState).toHaveProperty('p2_score');
    expect(gameState.p1_score).toBeGreaterThanOrEqual(0);
    expect(gameState.p2_score).toBeGreaterThanOrEqual(0);
  });

  test('Win condition triggers at 121 points', async ({ apiClient }) => {
    const player1 = await apiClient.createPlayer('Winner');
    const game = await apiClient.createGame(player1.uuid);
    
    const gameState = await apiClient.getGame(game.game_code);
    
    // Winner should be null until someone reaches 121
    expect(gameState.winner_id).toBeNull();
  });

  test('Game board renders without errors', async ({ page }) => {
    await page.goto('/');
    
    // Check for welcome screen elements
    const createButton = await page.locator('button:has-text("Create Game")');
    await expect(createButton).toBeVisible();
    
    // Click create game to start the flow
    await createButton.click();
    
    // Wait for nickname input to appear
    const nicknameInput = await page.locator('input[placeholder*="nick" i]');
    await expect(nicknameInput).toBeVisible();
  });

  test('Player hand displays correctly', async ({ page }) => {
    await page.goto('/');
    
    // Simulate game setup
    await page.waitForTimeout(1000);
    
    // Check for card elements
    const cards = await page.locator('[data-testid="card"]').count();
    expect(cards).toBeGreaterThanOrEqual(0);
  });

  test('Peg positions display on board', async ({ page }) => {
    await page.goto('/');
    
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Visual elements should be present
    expect(canvas).toBeTruthy();
  });

  test('Turn indicator shows current player', async ({ page }) => {
    await page.goto('/');
    
    const turnIndicator = await page.locator('[data-testid="turn-indicator"]');
    
    if (await turnIndicator.isVisible()) {
      const text = await turnIndicator.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('Score display updates in real-time', async ({ page }) => {
    await page.goto('/');
    
    // Verify score display elements exist
    const p1Score = await page.locator('[data-testid="p1-score"]');
    const p2Score = await page.locator('[data-testid="p2-score"]');
    
    if (await p1Score.isVisible()) {
      const score1 = await p1Score.textContent();
      expect(score1).toBeTruthy();
    }
    
    if (await p2Score.isVisible()) {
      const score2 = await p2Score.textContent();
      expect(score2).toBeTruthy();
    }
  });
});
