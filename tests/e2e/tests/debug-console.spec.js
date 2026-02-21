import { test } from '@playwright/test';

test('capture console errors on game board', async ({ page }) => {
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  
  // Use getState() properly
  await page.evaluate(() => {
    const store = window.__gameStore;
    if (store) {
      const s = store.getState();
      s.setScreen('game');
      s.setGamePhase('discard');
      s.setGameCode('TEST12');
      s.setP1Nickname('Alice');
      s.setP2Nickname('Bob');
      s.setPlayerHand([
        { rank: 'A', suit: 'spades' },
        { rank: '5', suit: 'hearts' },
        { rank: 'K', suit: 'clubs' },
        { rank: '7', suit: 'diamonds' },
        { rank: 'J', suit: 'spades' },
        { rank: '9', suit: 'hearts' },
      ]);
      s.setOpponentHand([
        { rank: '3', suit: 'spades' },
        { rank: '8', suit: 'clubs' },
        { rank: 'Q', suit: 'hearts' },
        { rank: '4', suit: 'diamonds' },
        { rank: '6', suit: 'spades' },
        { rank: '2', suit: 'clubs' },
      ]);
    }
  });
  
  await page.waitForTimeout(1500);
  
  console.log('CONSOLE ERRORS:', JSON.stringify(consoleErrors));
  
  // Screenshot
  await page.screenshot({ path: '/tmp/debug-board.png', fullPage: true });
});
