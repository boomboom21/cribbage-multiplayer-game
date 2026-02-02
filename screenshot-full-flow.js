const { chromium } = require('@playwright/test');

(async () => {
  try {
    const browser = await chromium.launch();
    
    // Browser 1: Player 1 (Boom)
    const page1 = await browser.newPage();
    await page1.setViewportSize({ width: 1280, height: 900 });
    
    console.log('👤 Browser 1: Starting as Boom...');
    await page1.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' });
    await page1.waitForTimeout(2000);
    
    // Enter nickname
    const nicknameInput1 = page1.locator('input[placeholder*="nick" i]');
    await nicknameInput1.fill('Boom');
    console.log('✓ Boom entered');
    
    // Click Create Game
    const createBtn = page1.locator('button:has-text("Create Game")');
    await createBtn.click();
    console.log('✓ Create Game clicked');
    
    // Wait for game to be created and board to render
    await page1.waitForTimeout(3000);
    
    // Screenshot game board for Boom
    await page1.screenshot({ path: 'screenshots/05-boom-game-board.png' });
    console.log('✓ Boom game board screenshot');
    
    // Extract game code from URL or display
    const url = page1.url();
    console.log(`URL: ${url}`);
    
    // Wait a bit for game initialization
    await page1.waitForTimeout(2000);
    
    // Take another screenshot showing full board
    await page1.screenshot({ path: 'screenshots/06-boom-board-ready.png', fullPage: true });
    console.log('✓ Full board screenshot');
    
    await browser.close();
    console.log('✅ Screenshots complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
