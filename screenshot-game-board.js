const { chromium } = require('@playwright/test');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    await page.setViewportSize({ width: 1280, height: 900 });
    
    console.log('📸 Loading welcome screen...');
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    // Enter nickname
    console.log('👤 Entering nickname...');
    const nicknameInput = page.locator('input[type="text"]');
    await nicknameInput.fill('Boom', { delay: 50 });
    await page.waitForTimeout(500);
    
    // Take screenshot
    await page.screenshot({ path: 'screenshots/05-welcome-filled.png' });
    
    // Submit form (press Enter or click button)
    console.log('✓ Submitting form...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000); // Wait for lobby to load
    
    // Take lobby screenshot
    await page.screenshot({ path: 'screenshots/06-game-lobby.png' });
    console.log('✓ Lobby screenshot');
    
    // Click create game button
    console.log('🎮 Creating game...');
    const createBtn = page.locator('button:has-text("Create New Game")');
    await createBtn.click();
    await page.waitForTimeout(4000); // Wait for game board to render
    
    // Take game board screenshot
    await page.screenshot({ path: 'screenshots/07-game-board-active.png' });
    console.log('✓ Game board screenshot');
    
    // Full page screenshot
    await page.screenshot({ path: 'screenshots/08-game-board-full.png', fullPage: true });
    console.log('✓ Full page screenshot');
    
    await browser.close();
    console.log('✅ All screenshots complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
