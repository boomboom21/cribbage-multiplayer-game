# Cribbage Backend Game Orchestration Design

**Purpose:** Define the complete game flow, state machine, and Socket.IO event sequence to match the frontend UI expectations.

---

## 1. Game Phases & State Machine

```
WAITING_FOR_PLAYERS
  ↓ (both players join)
DEALING
  ↓ (cards dealt, 2 sec auto-transition)
DISCARD
  ↓ (both players discard 2 cards)
PEGGING
  ↓ (all 4 cards played by each player)
COUNTING
  ↓ (hands scored, pegs moved)
  ├─→ DEALING (repeat if no winner)
  └─→ GAME_OVER (if anyone ≥121)
```

---

## 2. Game State (In-Memory or Session)

**Needed for orchestration (NOT just in DB):**

```javascript
{
  gameCode: "VHG4SC",
  phase: "PEGGING", // current phase
  
  // Players
  players: {
    player1: {
      uuid: "...",
      nickname: "Boom",
      socketId: "socket_id_1",
      position: 1, // player 1 or 2
      isDealer: false,
    },
    player2: {
      uuid: "...",
      nickname: "Jill",
      socketId: "socket_id_2",
      position: 2,
      isDealer: true,
    }
  },
  
  // Cards
  playerHands: {
    player1_uuid: [
      { suit: 'hearts', rank: 'A', value: 1 },
      // ... 6 cards initially, 4 after discard
    ],
    player2_uuid: [/* ... */]
  },
  
  discarded: {
    player1_uuid: [
      { suit: 'diamonds', rank: '5', value: 5 },
      { suit: 'clubs', rank: '3', value: 3 }
    ],
    player2_uuid: [/* 2 cards */]
  },
  
  cribCards: [ /* 4 cards after both discard */ ],
  
  // Pegging
  playedCards: [
    { playedBy: 'player1_uuid', card: {...}, timestamp },
    { playedBy: 'player2_uuid', card: {...}, timestamp },
    // ... in order played
  ],
  runningTotal: 25,
  
  // Scoring
  scores: {
    player1_uuid: 45,
    player2_uuid: 32,
  },
  pegPositions: {
    player1_uuid: 45,
    player2_uuid: 32,
  },
  
  // Turn tracking
  currentTurn: 'player2_uuid', // whose turn to play
  turnOrder: ['player2_uuid', 'player1_uuid'], // non-dealer first
}
```

---

## 3. Socket.IO Event Sequence

### Phase: DEALING

**Trigger:** Both players joined

```
Backend:
  1. Shuffle deck
  2. Deal 6 cards to each player
  3. Set phase = DEALING
  4. Emit to both players:

Client receives:
  io.on('cards_dealt', {
    playerHand: [6 cards],
    p1Nickname: "Boom",
    p2Nickname: "Jill",
    gamePhase: 'discard'
  })
```

Backend waits 2-3 seconds, then auto-transitions to DISCARD phase.

### Phase: DISCARD

**Trigger:** cards_dealt received, auto-transitioned

```
Backend:
  1. Set phase = DISCARD
  2. Emit to both players:

Client receives:
  io.on('waiting_for_discard', {})

Client shows DiscardPhase UI, waits for player click on 2 cards.

User clicks "Confirm Discard"
→ Frontend emits 'discard_cards' with selected 2 cards

Backend receives 'discard_cards':
  1. Validate 2 cards selected
  2. Store in discarded[playerUuid]
  3. Check if both players discarded
  4. If both done:
     a. Combine 4 cards into crib
     b. Each player left with 4 cards
     c. Determine turn order (non-dealer plays first)
     d. Emit to both players:

Client receives:
  io.on('both_discarded', {
    playerHand: [4 remaining cards],
    crib: [4 cards - dealer only? or both see?],
    currentTurn: 'player2_uuid', // who plays first (non-dealer)
    gamePhase: 'pegging'
  })
```

### Phase: PEGGING

**Trigger:** both_discarded received

```
Backend:
  1. Set phase = PEGGING
  2. Emit to both players:

Client receives:
  io.on('pegging_started', {
    currentTurn: 'player2_uuid'
  })

Client shows PeggingPhase UI, highlights playable cards (value ≤ 31 - current total)

User clicks card
→ Frontend emits 'play_card' with { card, playerUuid }

Backend receives 'play_card':
  1. Validate:
     a. It's that player's turn
     b. Card is in their hand
     c. Card + running total ≤ 31
  2. If invalid:
     a. Emit 'play_card_invalid' error
  3. If valid:
     a. Add card to playedCards array
     b. Update runningTotal += card.value
     c. Remove card from playerHand
     d. Check for pairs/runs/flush (SCORE points)
     e. Switch currentTurn to other player
     f. Emit to both players:

Client receives:
  io.on('card_played', {
    playedCard: {...},
    playedBy: 'player1_uuid',
    runningTotal: 27,
    score: 2, // points awarded (pairs, runs, etc.)
    nextTurn: 'player2_uuid',
    playedCards: [all cards played so far]
  })

  → Update board, move peg by 2 points, show "Scored 2!"

  If currentTurn player has no valid plays:
    a. Pass turn
    b. Other player tries
    c. If both pass → End of pegging round, reset running total to 0
    d. If pegging complete (all 4 cards played):
       → Emit 'pegging_finished'
       → Transition to COUNTING
```

### Phase: COUNTING

**Trigger:** pegging_finished

```
Backend:
  1. Set phase = COUNTING
  2. Score non-dealer's hand:
     a. Calculate fifteens, pairs, runs, flush, nibs
     b. Get total points
     c. Move peg
     d. Emit to both:

Client receives:
  io.on('hand_scored', {
    playerUuid: 'player1_uuid',
    score: 14,
    breakdown: {
      fifteens: 4 * 2 = 8,
      pairs: 1 * 2 = 2,
      runs: 2 * 3 = 6,
      flush: 0,
      nibs: 0,
    },
    newScore: 59,
    pegPosition: 59,
    p1Score: 59,
    p2Score: 32
  })

  → Client shows score breakdown animation, moves peg

  3. Wait 2 sec, then score dealer's hand same way
  4. Score crib (dealer's crib):

Client receives:
  io.on('crib_scored', {
    dealerUuid: 'player2_uuid',
    score: 8,
    breakdown: {...},
    newScore: 40,
    pegPosition: 40,
    p1Score: 59,
    p2Score: 40
  })

  5. Check if anyone ≥121:
     a. If yes → emit 'game_finished'
     b. If no → repeat (alternate dealer, go back to DEALING)

If winner:
  Emit to both:

Client receives:
  io.on('game_finished', {
    winner: 'player1_uuid',
    p1Score: 121,
    p2Score: 40,
    gamePhase: 'gameover'
  })

  → Client shows GameOverPhase with trophy
```

---

## 4. What Backend Needs to Do

### On Game Join (both players)
```javascript
socket.on('opponent_joined', () => {
  // Check if both players connected
  if (game.players.length === 2) {
    // Start dealing phase after 1 second
    setTimeout(() => startDealingPhase(game), 1000);
  }
});

function startDealingPhase(game) {
  game.shuffleDeck();
  game.dealCards(6, 6);
  game.phase = 'DEALING';
  
  // Emit to each player their own hand
  game.players.forEach(player => {
    io.to(player.socketId).emit('cards_dealt', {
      playerHand: game.getPlayerHand(player.uuid),
      p1Nickname: game.players[0].nickname,
      p2Nickname: game.players[1].nickname,
      gamePhase: 'discard'
    });
  });
  
  // Auto-transition to discard after 3 seconds
  setTimeout(() => startDiscardPhase(game), 3000);
}
```

### On Discard (each player)
```javascript
socket.on('discard_cards', (data) => {
  const { playerUuid, discardedCards } = data;
  
  // Validate & store
  game.discarded[playerUuid] = discardedCards;
  game.removeCardsFromHand(playerUuid, discardedCards);
  
  // Check if both discarded
  if (game.bothPlayersDiscarded()) {
    game.cribCards = [
      ...game.discarded[game.players[0].uuid],
      ...game.discarded[game.players[1].uuid]
    ];
    
    // Determine turn order (non-dealer first)
    const dealerUuid = game.dealerUuid;
    const nonDealerUuid = game.players.find(p => p.uuid !== dealerUuid).uuid;
    game.turnOrder = [nonDealerUuid, dealerUuid];
    game.currentTurn = nonDealerUuid;
    
    // Emit to both
    io.to(game.code).emit('both_discarded', {
      playerHand: // each player gets their own 4 cards
      crib: game.cribCards,
      currentTurn: game.currentTurn,
      gamePhase: 'pegging'
    });
    
    game.phase = 'PEGGING';
    io.to(game.code).emit('pegging_started', {
      currentTurn: game.currentTurn
    });
  }
});
```

### On Card Play
```javascript
socket.on('play_card', (data) => {
  const { playerUuid, card } = data;
  
  // Validate turn
  if (game.currentTurn !== playerUuid) {
    socket.emit('play_card_invalid', 'Not your turn');
    return;
  }
  
  // Validate playable (total ≤ 31)
  if (game.runningTotal + card.value > 31) {
    socket.emit('play_card_invalid', 'Would exceed 31');
    return;
  }
  
  // Play the card
  game.playCard(playerUuid, card);
  game.runningTotal += card.value;
  
  // Check for points (pairs, runs, flush immediately on play)
  const score = game.calculatePeggingScore();
  
  if (score > 0) {
    game.scores[playerUuid] += score;
    game.pegPositions[playerUuid] += score;
  }
  
  // Switch turn
  game.currentTurn = game.getOtherPlayer(playerUuid);
  
  // Emit to both
  io.to(game.code).emit('card_played', {
    playedCard: card,
    playedBy: playerUuid,
    runningTotal: game.runningTotal,
    score: score,
    nextTurn: game.currentTurn,
    playedCards: game.playedCards
  });
  
  // Check if all cards played
  if (game.allCardsPlayed()) {
    game.phase = 'COUNTING';
    io.to(game.code).emit('pegging_finished', {});
    
    // Wait 2 sec, then start counting
    setTimeout(() => startCountingPhase(game), 2000);
  }
});
```

---

## 5. Key Design Principles

1. **Backend drives the game** - Not the frontend clicking buttons
2. **Events are phase transitions** - Not individual actions
3. **Phase management** - Explicit state machine, not scattered logic
4. **Validation on backend** - Don't trust client claims
5. **In-memory state** - Fast access during gameplay, sync to DB for history
6. **Deterministic timing** - Auto-transitions on fixed schedules (dealing → 3 sec → discard → auto → pegging)

---

## 6. Files to Create/Modify

**New:**
- `backend/src/game/GameOrchestrator.js` - Main state machine and event handler
- `backend/src/game/GamePhases.js` - Dealing, Discard, Pegging, Counting logic
- `backend/src/game/PeggingScorer.js` - Calculate points during pegging

**Modify:**
- `backend/src/index.js` - Wire up Socket.IO listeners to GameOrchestrator
- `backend/src/game/game.js` - Add orchestration methods to CribbageGame class

---

**Status:** Ready for implementation with codex

