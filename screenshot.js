const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('📸 Capturing Welcome Screen...');
    await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    
    const screenshotPath = 'screenshots/01-welcome-screen.png';
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`✓ Screenshot saved: ${screenshotPath}`);
    
    // Try to interact with the UI
    const nicknameInput = page.locator('input[placeholder*="nick" i]');
    try {
      if (await nicknameInput.isVisible({ timeout: 2000 })) {
        console.log('📸 Entering nickname...');
        await nicknameInput.fill('Player1');
        await page.waitForTimeout(500);
        
        const screenshotPath2 = 'screenshots/02-nickname-entered.png';
        await page.screenshot({ path: screenshotPath2, fullPage: false });
        console.log(`✓ Screenshot saved: ${screenshotPath2}`);
      }
    } catch (e) {
      console.log('Note: Nickname input not found (may still be loading)');
    }
    
    await browser.close();
    console.log('✅ Screenshots complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
