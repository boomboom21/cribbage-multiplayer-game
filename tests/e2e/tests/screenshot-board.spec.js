import { test } from '@playwright/test';

test('screenshot: game board with cards', async ({ page }) => {
  await page.setViewportSize({ width: 520, height: 950 });
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  
  // Use the exposed store to set state
  const result = await page.evaluate(() => {
    const store = window.__gameStore;
    if (!store) return 'no store';
    const s = store.getState();
    s.setScreen('game');
    s.setGamePhase('discard');
    s.setGameCode('DEMO1');
    s.setP1Nickname('Alice');
    s.setP2Nickname('Bob');
    s.setP1Score(15);
    s.setP2Score(8);
    s.setP1PegPosition(15);
    s.setP2PegPosition(8);
    s.setPlayerHand([
      { rank: 'A', suit: 'spades' },
      { rank: '5', suit: 'hearts' },
      { rank: 'K', suit: 'clubs' },
      { rank: '7', suit: 'diamonds' },
      { rank: 'J', suit: 'spades' },
      { rank: '9', suit: 'hearts' },
    ]);
    if (s.setOpponentHand) {
      s.setOpponentHand([
        { rank: '3', suit: 'spades' },
        { rank: '8', suit: 'clubs' },
        { rank: 'Q', suit: 'hearts' },
        { rank: '4', suit: 'diamonds' },
        { rank: '6', suit: 'spades' },
        { rank: '2', suit: 'clubs' },
      ]);
    }
    return 'ok';
  });
  
  console.log('Store injection result:', result);
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/gameboard.png', fullPage: true });
});
