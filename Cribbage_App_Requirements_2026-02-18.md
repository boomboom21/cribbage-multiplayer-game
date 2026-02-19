# Cribbage Multiplayer Game Application - Requirements Document

**Generated:** February 18, 2026  
**Original Task:** #10 (In Progress)  
**Status:** Backend in progress, frontend pending

---

## Executive Summary

A real-time multiplayer Cribbage card game built with modern web technologies. Players can create/join game rooms, play against friends or AI opponents, with live score tracking and game state synchronization.

---

## Core Requirements

### 1. Game Mechanics (Cribbage Rules)

#### Phase 1: The Deal
- [ ] 6 cards dealt to each player (2 players standard)
- [ ] Each player selects 2 cards for the crib (dealer's extra hand)
- [ ] Crib belongs to dealer, scored at end of hand

#### Phase 2: The Cut
- [ ] Dealer cuts the deck, revealing starter card
- [ ] If starter is a Jack, dealer gets 2 points ("His Heels")

#### Phase 3: The Play (Pegging)
- [ ] Players alternate playing cards, keeping running count ≤ 31
- [ ] Score 2 points for making exactly 15
- [ ] Score 2 points for making exactly 31
- [ ] Score 1 point for playing last card ("Go")
- [ ] Score points for pairs, runs during play
- [ ] Cannot exceed 31 (must say "Go" if cannot play)

#### Phase 4: The Show (Counting Hands)
- [ ] Dealer counts hand + crib
- [ ] Non-dealer counts hand first
- [ ] Score points for:
  - 15s (2 points each combination)
  - Pairs (2 points per pair)
  - Runs (1 point per card in sequence)
  - Flush (4-5 cards same suit)
  - "His Nobs" (Jack same suit as starter = 1 point)

#### Winning
- [ ] First player to reach 121 points wins
- [ ] Can win by pegging (play phase) or counting (show phase)
- [ ] Skunk rule: Win by 30+ points counts as 2 games

---

## Technical Architecture

### Backend (Node.js + Express + Socket.IO)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Server** | Node.js + Express | HTTP API, static serving |
| **Real-time** | Socket.IO | Game state sync, player actions |
| **Game Logic** | JavaScript classes | Card dealing, scoring, rules engine |
| **State Management** | In-memory + Redis | Game rooms, player sessions |
| **Database** | SQLite/Redis | Game history, user stats, leaderboards |

#### Socket.IO Events Required:
```javascript
// Game Room Events
'room:create'     // Create new game room
'room:join'       // Join existing room
'room:leave'      // Exit room
'room:list'       // List available rooms

// Game Play Events
'game:deal'       // Deal cards to players
'game:discard'    // Select 2 cards for crib
'game:cut'        // Cut for starter card
'game:playCard'   // Play card during pegging
'game:go'         // Cannot play (pass)
'game:show'       // Signal ready to show
'game:count'      // Count hand score

// State Events
'game:state'      // Full game state broadcast
'game:update'     // Partial state update
'game:over'       // Game ended with winner
'game:error'      // Invalid move error

// Chat Events
'chat:message'    // Send room message
'chat:system'     // System announcements
```

#### Game Logic Classes:
```javascript
class Card { rank, suit, value }
class Player { id, name, hand, score }
class GameRoom { id, players, dealer, phase, state }
class CribbageEngine { deal(), play(), score(), validate() }
class Scoring { fifteens(), pairs(), runs(), flush(), nobs() }
```

### Frontend (React + Tailwind CSS)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18 | UI components, state management |
| **Styling** | Tailwind CSS | Card styling, responsive layout |
| **Real-time** | Socket.IO Client | WebSocket connection to backend |
| **Animations** | Framer Motion | Card dealing, pegging animations |
| **State** | Context API + Zustand | Game state, user state |

#### UI Components Needed:
```
App
├── Lobby
│   ├── RoomList (available games)
│   ├── CreateRoomForm
│   └── JoinRoomForm
├── GameRoom
│   ├── PlayerArea (hand, played cards)
│   ├── OpponentArea (card backs, score)
│   ├── CribArea (dealer indicator)
│   ├── PlayArea (running count, pegging)
│   ├── ScoreBoard (current scores)
│   ├── ChatPanel
│   └── GameControls (deal, count, etc.)
└── GameOver
    ├── WinnerDisplay
    ├── FinalScores
    └── PlayAgainButton
```

#### Visual Design:
- **Cards:** Standard 52-card deck, SVG or high-res PNG
- **Board:** Virtual cribbage board with peg tracks
- **Theme:** Classic card table (green felt background)
- **Responsive:** Works on desktop, tablet, mobile

---

## Multiplayer Features

### Room System
- [ ] Public rooms (anyone can join)
- [ ] Private rooms (password protected)
- [ ] Spectator mode (watch games)
- [ ] Max 2 players + spectators per room
- [ ] Room capacity display

### Matchmaking (Future)
- [ ] Quick play (auto-match with random player)
- [ ] Ranked matches (Elo rating system)
- [ ] Tournament brackets

---

## AI Opponent (Future Enhancement)

### Single-Player Mode
- [ ] 3 AI difficulty levels (Easy, Medium, Hard)
- [ ] AI makes optimal discards to crib
- [ ] AI plays tactically during pegging
- [ ] AI calculates best show scoring

### AI Strategy Components
- Crib selection optimization
- Pegging probability calculation
- Risk/reward assessment on "Go"
- Blocking opponent runs

---

## Current Status (Feb 18, 2026)

### Completed ❌
- Socket.IO server structure
- Basic Express backend
- Card/deck models

### In Progress 🔄
- Game logic engine (pegging, scoring)
- React frontend initiation
- Room management

### Pending ⏳
- Complete UI components
- Animations and polish
- AI opponent
- Leaderboards/stats

---

## Original Prompt Context

Based on memory files, the cribbage task was created as **Task #10** in the Clippy Board system. The original request appears to have been:

> *"Build a multiplayer Cribbage card game with Socket.IO for real-time gameplay. Players can create rooms, play against friends, with proper cribbage rules scoring. Modern web stack — React frontend, Node.js backend."*

**Specific requirements mentioned:**
- Real-time multiplayer (Socket.IO)
- React-based UI
- Proper Cribbage rules
- Room-based matchmaking
- Score tracking
- Game history

---

## Next Steps to Complete

1. **Backend:** Complete pegging logic and scoring engine
2. **Frontend:** Build React components (cards, board, scoring)
3. **Integration:** Connect Socket.IO events to UI
4. **Testing:** Add unit tests for scoring rules
5. **Polish:** Animations, sound effects, responsive design

---

**Access:** `\\192.168.160.10\shared\Cribbage_App_Requirements_2026-02-18.md`
