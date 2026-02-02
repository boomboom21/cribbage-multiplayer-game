# Cribbage Game UI & Card System Architecture

**Date:** February 2, 2026  
**Status:** Architecture Design (Pre-Implementation)

---

## Overview

Current implementation has backend game logic but ZERO frontend UX. Players see an empty Phaser canvas. This document outlines the complete card dealing + board visualization system.

---

## 1. Game Flow (Frontend)

```
WelcomeScreen
  ↓ (both players enter nicknames)
GameLobby (create/join game)
  ↓ (game created, both players join)
DealingPhase (show 6 cards to each player)
  ↓ (backend deals)
DiscardPhase (select 2 cards to crib)
  ↓ (both players discard)
PeggingPhase (play cards one at a time)
  ↓ (alternate plays until no one can play)
CountingPhase (score hands + crib)
  ↓ (both players' scores shown on board)
GameBoard (repeat pegging/counting until 121)
  ↓ (first to 121 wins)
GameOver (winner display)
```

---

## 2. Card System Design

### 2.1 Data Structure

**Player Hand** (6 cards)
```javascript
{
  uuid: "player-uuid",
  nickname: "Boom",
  hand: [
    { suit: 'hearts', rank: 'A', value: 1 },
    { suit: 'diamonds', rank: '5', value: 5 },
    { suit: 'clubs', rank: '10', value: 10 },
    // ... 6 cards total
  ],
  discarded: [], // 2 cards selected for crib
  played: [], // cards played during pegging
  score: 0,
  pegPosition: 0, // 0-121 on board
}
```

**Crib** (4 cards)
```javascript
{
  cards: [
    { suit: 'spades', rank: 'K', value: 10 },
    // ... 4 cards (2 from each player's discard)
  ],
  owner: 'player1-uuid', // who's crib it is (dealer)
  scored: false,
}
```

### 2.2 Card Components

**CardHand.jsx**
- Display 6 cards in a hand layout
- Clickable cards (highlight when selected)
- Show suit + rank clearly
- Hover effects for interactivity

**Card.jsx**
- Individual card component
- Shows: Suit (♥/♦/♣/♠), Rank (A/2-10/J/Q/K), Value (1-13)
- Styling: White card with centered text
- States: normal, hovered, selected, disabled

**DiscardPhase.jsx**
- Show both players' hands side-by-side (or one at a time)
- Allow selection of exactly 2 cards
- "Confirm Discard" button
- Show selected cards in "Discard Pile" temporarily
- Wait for both players to confirm

**PlayedCards.jsx**
- Show cards played during pegging phase
- Display in order played
- Show running total of values

---

## 3. Board Visualization

### 3.1 Cribbage Board Layout

**Physical Board:**
- Rectangular wooden board with holes
- 4 rows of 30 holes = 120 holes + 1 home hole = 121 total
- Track layout: Start (0) → Path → 60-point mark → Path → 121 (home)
- Two pegs per player (one active, one scoring)

**Digital Board (SVG or Canvas):**
```
P1 Track: [●] [●] [●]... [●] (121 holes)
          ↑
       Pegs

P2 Track: [●] [●] [●]... [●] (121 holes)
          ↑
       Pegs
```

### 3.2 Board Components

**CribbageBoard.jsx** (replaces current Phaser scene)
- SVG-based design (easier to style than Phaser)
- Show both player tracks
- Animate peg movement (move from old position to new)
- Display pegs as colored circles (P1=blue, P2=red)
- Show scores above tracks

**PegTrack.jsx**
- 121 hole positions laid out
- Render holes as small circles
- Highlight current peg positions
- Support peg animation

**ScoreDisplay.jsx**
- Show P1 score + position
- Show P2 score + position
- Display game phase ("Pegging...", "Counting...", etc.)
- Show whose turn it is

---

## 4. Phase Management

### 4.1 Dealing Phase
- **Trigger:** Game created, both players connected
- **Action:** Backend shuffles deck, deals 6 to each player
- **Frontend:** Display DealingPhase component
  - Show "Dealing..." animation (cards appearing)
  - After 2-3 seconds, transition to DiscardPhase
  - Show both players' 6 cards

### 4.2 Discard Phase
- **Trigger:** Both players loaded with 6 cards
- **Action:** Each player selects 2 cards to discard to crib
- **Frontend:** DiscardPhase component
  - Player 1 selects 2 cards
  - "Confirm Discard" button
  - Player 2 selects 2 cards
  - "Confirm Discard" button
  - Backend combines discards into crib
  - Auto-transition when both confirmed

### 4.3 Pegging Phase
- **Trigger:** Crib formed, 4 cards remain in each hand
- **Action:** Players alternate playing 1 card
- **Frontend:** PeggingPhase component
  - Show player's remaining hand (4 cards)
  - Highlight playable cards (value ≤ 31 - current total)
  - Click card to play
  - Display played cards in a row
  - Show running total (e.g., "Total: 25")
  - When total hits 31, reset and show points scored
  - Continue until no one can play

### 4.4 Counting Phase
- **Trigger:** All pegging plays done (0 points or no valid plays)
- **Action:** Score hand + crib
- **Frontend:** CountingPhase component
  - Non-dealer scores hand first (tradition)
  - Show score breakdown (fifteens, pairs, runs, flush, nibs)
  - Animate score +points on board
  - Move pegs accordingly
  - Show dealer's score next
  - Show crib score (dealer's points)
  - Winner announcement if ≥121

---

## 5. Socket.IO Events (Frontend Listeners)

### New Events Needed

```javascript
// Dealing
socket.on('cards_dealt', (data) => {
  // data: { playerHand: [cards], gamePhase: 'discard' }
  // Update state, show DiscardPhase
});

// Discard
socket.on('waiting_for_discard', () => {
  // Show DiscardPhase, enable card selection
});

socket.on('both_discarded', (data) => {
  // data: { crib: [cards], playerHand: [remaining 4] }
  // Transition to PeggingPhase
});

// Pegging
socket.on('pegging_started', () => {
  // Show PeggingPhase, enable card plays
});

socket.on('card_played', (data) => {
  // data: { playedCard, playedBy, runningTotal, score }
  // Show played card, update total
});

socket.on('pegging_finished', () => {
  // Transition to CountingPhase
});

// Counting
socket.on('hand_scored', (data) => {
  // data: { playerUuid, score, breakdown }
  // Show score breakdown, animate peg movement
});

socket.on('crib_scored', (data) => {
  // data: { dealerUuid, score, breakdown }
  // Show crib score
});

socket.on('game_finished', (data) => {
  // data: { winner, finalScore }
  // Show GameOver screen
});
```

---

## 6. Component Hierarchy

```
GameBoard.jsx (main container)
├── ScoreDisplay.jsx (top: both players' scores)
├── CribbageBoard.jsx (center: board with pegs)
│   ├── PegTrack.jsx (P1 track)
│   └── PegTrack.jsx (P2 track)
└── GamePhaseRenderer.jsx (bottom: current phase UI)
    ├── DealingPhase.jsx
    ├── DiscardPhase.jsx
    │   └── CardHand.jsx
    │       └── Card.jsx (×6)
    ├── PeggingPhase.jsx
    │   ├── CardHand.jsx
    │   │   └── Card.jsx (×4)
    │   └── PlayedCards.jsx
    └── CountingPhase.jsx
        └── ScoreBreakdown.jsx
```

---

## 7. Implementation Priorities

**Phase 1 (MVP - Must Have):**
1. CardHand.jsx + Card.jsx (display 6 cards)
2. DiscardPhase.jsx (select 2, confirm)
3. CribbageBoard.jsx (basic SVG board with pegs)
4. Socket.IO event listeners (all above)

**Phase 2 (Polish):**
1. Card animations (fade in on deal)
2. Peg animations (slide along track)
3. Score animations (bounce on board)
4. Sound effects (optional)

**Phase 3 (Future):**
1. Hand scoring breakdown UI
2. Statistics tracking
3. Replay system

---

## 8. Technical Decisions

**Why SVG for Board (not Phaser)?**
- Easier to position pegs precisely
- Better text rendering for scores
- Simpler animation (CSS transitions)
- No 3D rendering needed
- Responsive design easier

**Card Layout:**
- Use CSS Grid or Flexbox
- Cards fan out if many selected
- Click to select/deselect
- Highlight selected cards

**State Management (Zustand):**
```javascript
const gameStore = {
  gamePhase: 'dealing', // dealing, discard, pegging, counting
  playerHand: [], // 6 cards initially, 4 after discard
  discardedCards: [], // 2 cards selected for crib
  cribCards: [], // 4 cards in crib
  playedCards: [], // cards played so far
  currentTotal: 0, // running total in pegging
  p1Score: 0,
  p2Score: 0,
  p1PegPosition: 0,
  p2PegPosition: 0,
  currentTurn: 'player1', // whose turn
}
```

---

## 9. Success Criteria

- [x] Cards visible to players (6 in hand)
- [x] Card selection for discard (2 cards to crib)
- [x] Cribbage board looks like a board (not random shapes)
- [x] Pegs move along track (0-121)
- [x] Scores displayed on board
- [x] Game phases flow correctly
- [x] Both players see same board state (via Socket.IO)

---

**Next Step:** Spawn codex with this spec to implement all components.
