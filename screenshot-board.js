const { chromium } = require('@playwright/test');
const axios = require('axios');

(async () => {
  try {
    const API_URL = 'http://localhost:3002';
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 900 });
    
    console.log('🎮 Creating game via API...');
    
    // Create two players
    const p1Res = await axios.post(`${API_URL}/api/players`, { nickname: 'Boom' });
    const p2Res = await axios.post(`${API_URL}/api/players`, { nickname: 'Jill' });
    
    const p1 = p1Res.data;
    const p2 = p2Res.data;
    
    console.log(`✓ Players created: ${p1.nickname} (${p1.uuid}), ${p2.nickname} (${p2.uuid})`);
    
    // Create game
    const gameRes = await axios.post(`${API_URL}/api/games`, { playerId: p1.id });
    const game = gameRes.data;
    console.log(`✓ Game created: ${game.game_code}`);
    
    // Join game
    await axios.post(`${API_URL}/api/games/${game.game_code}/join`, { playerId: p2.id });
    console.log(`✓ Player 2 joined game`);
    
    // Navigate to game board
    console.log('📸 Capturing game board...');
    await page.goto(`http://localhost:5174/?gameCode=${game.game_code}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000); // Let Phaser board render
    
    const screenshotPath = 'screenshots/03-game-board.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✓ Screenshot saved: ${screenshotPath}`);
    
    // Look for canvas (Phaser board)
    const canvas = page.locator('canvas');
    if (await canvas.isVisible()) {
      console.log('✓ Game board rendered successfully');
    }
    
    // Try to find game info
    const gameCodeDisplay = page.locator('[data-testid="game-code"]');
    if (await gameCodeDisplay.isVisible()) {
      console.log('✓ Game code displayed');
    }
    
    // Capture with full page to show entire board
    await page.screenshot({ path: 'screenshots/04-game-board-full.png', fullPage: true });
    console.log('✓ Full page screenshot saved');
    
    await browser.close();
    console.log('✅ Board screenshots complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
