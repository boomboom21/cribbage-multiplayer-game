# CODEX IMPLEMENTATION PROMPT - Cribbage UI

**Task:** Implement complete card dealing + cribbage board visualization frontend system based on ARCHITECTURE_CRIBBAGE_UI.md

---

## Current State

**Existing Code:**

### gameStore.js
```javascript
import { create } from 'zustand';

const useGameStore = create((set) => ({
  screen: 'welcome',
  player: null,
  game: null,
  gameCode: null,
  socket: null,
  gameState: null,
  toast: null,
  
  setScreen: (screen) => set({ screen }),
  setPlayer: (player) => set({ player }),
  setGame: (game) => set({ game }),
  setGameCode: (gameCode) => set({ gameCode }),
  setSocket: (socket) => set({ socket }),
  setGameState: (gameState) => set({ gameState }),
  setToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => set({ toast: null }), 3000);
  },
}));

export default useGameStore;
```

**EXTEND THIS WITH:**
```javascript
  gamePhase: 'welcome', // welcome, dealing, discard, pegging, counting, gameover
  playerHand: [], // 6 cards
  discardedCards: [], // 2 cards selected
  cribCards: [], // 4 cards in crib
  playedCards: [], // cards played in pegging
  currentTotal: 0, // running total in pegging
  p1Score: 0,
  p2Score: 0,
  p1PegPosition: 0,
  p2PegPosition: 0,
  currentTurn: null,
  selectedCardIndices: [], // for selecting discard

  // New setters
  setGamePhase: (phase) => set({ gamePhase: phase }),
  setPlayerHand: (hand) => set({ playerHand: hand }),
  setDiscardedCards: (cards) => set({ discardedCards: cards }),
  // ... etc for all new state
```

### socket.js (current)
```javascript
import { io } from 'socket.io-client';

export function createSocket() {
  return io(undefined, {
    path: '/socket.io',
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });
}

export function setupGameListeners(socket, handlers) {
  const {
    onGameState,
    onCardPlayed,
    onPegMoved,
    onPegMoveInvalid,
    onTurnChanged,
    onGameFinished,
    onOpponentJoined,
    onError,
  } = handlers;

  if (onGameState) socket.on('game_state', onGameState);
  if (onCardPlayed) socket.on('card_played', onCardPlayed);
  if (onPegMoved) socket.on('peg_moved', onPegMoved);
  if (onPegMoveInvalid) socket.on('peg_move_invalid', onPegMoveInvalid);
  if (onTurnChanged) socket.on('turn_changed', onTurnChanged);
  if (onGameFinished) socket.on('game_finished', onGameFinished);
  if (onOpponentJoined) socket.on('opponent_joined', onOpponentJoined);
  if (onError) socket.on('error', onError);
}

export function emitGameAction(socket, action, data) {
  socket.emit(action, data);
}
```

**ADD THESE NEW LISTENERS:**
```javascript
socket.on('cards_dealt', (data) => {
  // { playerHand: [cards], gamePhase: 'discard' }
});

socket.on('waiting_for_discard', () => {
  // Show DiscardPhase
});

socket.on('both_discarded', (data) => {
  // { crib: [cards], playerHand: [remaining 4] }
});

socket.on('pegging_started', () => {
  // Transition to PeggingPhase
});

socket.on('card_played', (data) => {
  // { playedCard, playedBy, runningTotal, score }
});

socket.on('hand_scored', (data) => {
  // { playerUuid, score, breakdown }
});

socket.on('crib_scored', (data) => {
  // { dealerUuid, score, breakdown }
});
```

---

## Components to Create

### 1. Card.jsx
Single card component. Shows suit + rank. Clickable states (normal, hovered, selected, disabled).

### 2. CardHand.jsx
Display 6 cards in hand layout. Handles click/select. Show visually which are selected.

### 3. DiscardPhase.jsx
Show player's 6 cards. Select exactly 2. Show "Confirm Discard" button. Wait for other player.

### 4. DealingPhase.jsx
Show "Dealing cards..." animation. Display 6 cards appearing. Auto-transition after 3 sec.

### 5. PeggingPhase.jsx
Show 4 remaining cards in hand. Highlight playable (value ≤ 31 - total). Click to play. Show running total.

### 6. CountingPhase.jsx
Show score breakdown. Animate peg movement. Show points awarded.

### 7. CribbageBoard.jsx (SVG)
- Main board container
- Two peg tracks (121 holes each)
- Peg positions (blue = P1, red = P2)
- Score display above each track
- Animate peg sliding

### 8. PegTrack.jsx
- Render 121 holes in track pattern
- Show current peg position
- Support animation

### 9. ScoreDisplay.jsx
- Show both players' names + scores
- Show current phase
- Show whose turn

### 10. GamePhaseRenderer.jsx
- Route to correct phase component based on gamePhase state
- Handle transitions between phases

### 11. Updated GameBoard.jsx
- Replace Phaser with new components
- Wire up Socket.IO listeners
- Handle state updates

---

## Styling Requirements

- **Dark theme:** Background #1a1a1a, cards white, text light gray
- **Orange accents:** #f59e0b for highlights, selected states
- **Card size:** 80px × 120px (standard card ratio)
- **Board:** SVG with clear hole positions, pegs as circles
- **Mobile responsive:** Grid/flex layouts that stack on mobile
- **Animations:** CSS transitions for peg sliding, card fading

---

## Files to Create/Modify

**NEW:**
- `frontend/src/components/Card.jsx`
- `frontend/src/components/CardHand.jsx`
- `frontend/src/components/DiscardPhase.jsx`
- `frontend/src/components/DealingPhase.jsx`
- `frontend/src/components/PeggingPhase.jsx`
- `frontend/src/components/CountingPhase.jsx`
- `frontend/src/components/CribbageBoard.jsx`
- `frontend/src/components/PegTrack.jsx`
- `frontend/src/components/ScoreDisplay.jsx`
- `frontend/src/components/GamePhaseRenderer.jsx`
- `frontend/src/components/Card.module.css`
- `frontend/src/components/CardHand.module.css`
- `frontend/src/components/CribbageBoard.module.css`
- etc. (CSS modules for all components)

**MODIFY:**
- `frontend/src/store/gameStore.js` (add all phase state + setters)
- `frontend/src/screens/GameBoard.jsx` (use new components)
- `frontend/src/utils/socket.js` (add new listeners)

---

## Implementation Order

1. Card.jsx + CardHand.jsx (foundation)
2. DiscardPhase.jsx (core gameplay)
3. CribbageBoard.jsx + PegTrack.jsx (board visuals)
4. ScoreDisplay.jsx (info display)
5. DealingPhase.jsx + PeggingPhase.jsx + CountingPhase.jsx (other phases)
6. GamePhaseRenderer.jsx (routing)
7. Update GameBoard.jsx, gameStore.js, socket.js (integration)

---

## Success Criteria

- Cards visible and clickable
- Discard phase works (select 2, confirm)
- Board looks like a cribbage board (not random shapes)
- Pegs move along 0-121 track
- Scores display correctly
- Game phases flow: dealing → discard → pegging → counting → gameover
- Mobile responsive
- Dark theme throughout

---

**GO BUILD IT!**
