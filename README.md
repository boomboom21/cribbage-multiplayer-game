# 🎴 Cribbage Multiplayer Game

A polished, multiplayer cribbage game prototype built with React + Vite (frontend), Node.js + Express (backend), PostgreSQL, Socket.IO, and Phaser 3.

## 🎮 Features

- **Full Cribbage Rules**: 15s, pairs, runs, flushes, nibs
- **Manual Peg Movement**: Players drag pegs on the scoring board for authentic gameplay
- **Real-Time Multiplayer**: Socket.IO for live synchronization
- **Game Codes**: Easy join system with 6-letter codes
- **Responsive Design**: Mobile-friendly with dark theme and orange accents
- **Smooth Animations**: Polished UI with transitions and visual feedback
- **Statistics**: Track games played, wins, average scores

## 🏗️ Project Structure

```
cribbage-multiplayer-game/
├── docker-compose.yml          # Docker setup
├── db/
│   └── migrations/
│       └── 001_init_schema.sql # Database schema
├── backend/                     # Express + Node.js server
│   ├── src/
│   │   ├── index.js            # Server entry point
│   │   ├── db.js               # Database connection
│   │   ├── models/             # Database models
│   │   └── game/               # Game logic
│   │       ├── deck.js         # Card utilities
│   │       ├── scoring.js      # Scoring rules
│   │       └── game.js         # Game state management
│   ├── package.json
│   └── Dockerfile
└── frontend/                    # React + Vite app
    ├── src/
    │   ├── main.jsx            # Entry point
    │   ├── App.jsx             # Main app component
    │   ├── store/              # Zustand state management
    │   ├── screens/            # Page components
    │   ├── components/         # Reusable components
    │   └── scenes/             # Phaser scenes
    ├── index.html
    ├── package.json
    └── Dockerfile
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)

### Using Docker (Recommended)

```bash
# Navigate to project
cd /home/clawd/Share/projects/cribbage-multiplayer-game

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

Services will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Database**: localhost:5432

### Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🎯 How to Play

1. **Welcome**: Enter your nickname
2. **Create/Join Game**: 
   - Create a new game and share the 6-letter code
   - Or join an existing game with a code
3. **Deal Phase**: Game deals 6 cards to each player
4. **Discard Phase**: Discard 2 cards to the crib
5. **Play Phase**: Alternate playing cards, scoring for 15s, pairs, runs
6. **Counting Phase**: Count hands for additional points
7. **Win**: First to 121 points wins!

## 🎲 Cribbage Scoring

- **15s**: Any combination totaling 15 = 2 points
- **Pairs**: Two same-rank cards = 2 points
- **Runs**: Three+ cards in sequence = points × length
- **Flush**: All cards same suit = 4 points (5 with cut card)
- **Nibs**: Jack in hand, same suit as cut card = 1 point

## 💾 Database Schema

### players
- `id` (serial)
- `uuid` (unique)
- `nickname`
- `created_at`

### games
- `id` (serial)
- `game_code` (6 chars, unique)
- `player1_id`, `player2_id` (foreign keys)
- `winner_id`
- `p1_score`, `p2_score`
- `status` (waiting, dealing, playing, finished)
- `game_state` (JSON)
- `created_at`, `finished_at`

### game_moves
- `id`
- `game_id` (foreign key)
- `player_id` (foreign key)
- `move_type` (deal, discard, play, count, peg_move)
- `move_data` (JSON)
- `created_at`

## 🔌 Socket.IO Events

### Client → Server
- `join_game`: { gameCode, playerId }
- `play_card`: { gameCode, playerId, cardIndex }
- `peg_move`: { gameCode, playerId, fromPosition, toPosition, pointsAwarded }

### Server → Client
- `game_state`: Current game state
- `card_played`: { playerId, score, totalInPlay }
- `peg_moved`: { playerId, newPosition }
- `peg_move_invalid`: Validation error
- `game_finished`: { winner, p1Score, p2Score }

## 🎨 Design System

- **Dark Theme**: #1a1a1a background
- **Primary Color**: Orange (#f59e0b)
- **Accent Colors**: Red (#ff6b6b), Green (#10b981)
- **Typography**: System fonts, responsive sizing

## 📝 API Endpoints

### Players
- `POST /api/players` - Create player
- `GET /api/players/:uuid/stats` - Get player stats

### Games
- `POST /api/games` - Create game
- `POST /api/games/:gameCode/join` - Join game
- `GET /api/games/:gameCode` - Get game details

## 🧪 Testing

```bash
# Start services
docker-compose up -d

# Open browser to http://localhost:5173
# Create first player and game
# Open new tab, join with game code
# Test gameplay
```

## 🛠️ Development

### Backend Updates
The backend runs with `npm run dev` which watches for file changes.

### Frontend Updates  
Vite provides hot module reloading (HMR) during development.

### Database
Schema is auto-initialized on startup via migrations.

## 🚢 Deployment

For production:

```bash
# Build frontend
cd frontend
npm run build

# Set environment variables
export NODE_ENV=production
export DATABASE_URL=postgres://...
export FRONTEND_URL=https://your-domain.com

# Start backend
cd ../backend
npm install --production
npm start
```

## 📦 Dependencies

### Backend
- express (HTTP server)
- socket.io (Real-time communication)
- pg (PostgreSQL client)
- uuid (UUID generation)
- cors (CORS middleware)

### Frontend
- react (UI library)
- react-dom (React rendering)
- vite (Build tool)
- phaser (Game framework)
- socket.io-client (WebSocket client)
- zustand (State management)
- axios (HTTP client)

## 🐛 Known Issues & TODOs

- [ ] Implement full card dealing UI
- [ ] Add hand counting phase
- [ ] Implement crib phase
- [ ] Add chat functionality
- [ ] Add sound effects
- [ ] Implement game history/replay
- [ ] Mobile touch optimizations
- [ ] Add player avatars

## 📄 License

MIT

## 👨‍💻 Author

Built as a demo of modern multiplayer game development with React, Node.js, and Socket.IO.

---

**Happy playing! 🎴✨**
