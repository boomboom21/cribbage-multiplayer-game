# Quick Start Guide - Cribbage Multiplayer Game

## Docker Setup (Easiest)

```bash
cd /home/clawd/Share/projects/cribbage-multiplayer-game
docker-compose up -d
```

Wait ~30 seconds for services to start, then:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001/api/health

## Local Development

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3001
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Terminal 3: Database
```bash
# Already set up in Docker, or:
psql postgresql://cribbage:cribbage_dev_password@localhost:5432/cribbage_game
```

## First Game

1. Open http://localhost:5173
2. Enter nickname, click "Start Playing"
3. Click "Create New Game", note the code
4. Open new browser tab/window
5. Enter same nickname (or different), click "Start Playing"
6. Click "Join Game", paste the code
7. Game starts!

## Troubleshooting

**Port already in use?**
```bash
docker-compose down
# or kill process on specific port:
lsof -i :5173  # find process
kill -9 <PID>
```

**Database connection error?**
```bash
# Check database is running:
docker ps | grep postgres
# If not, restart:
docker-compose restart postgres
```

**Modules not found?**
```bash
# Clear node_modules and reinstall:
rm -rf frontend/node_modules backend/node_modules
docker-compose down
docker-compose up -d
```

## Architecture

- **Backend** (Express): Game logic, player management, database
- **Frontend** (React + Vite): UI, Phaser game board
- **WebSocket** (Socket.IO): Real-time game synchronization
- **Database** (PostgreSQL): Players, games, move history

## Key Files

**Game Logic:**
- `backend/src/game/deck.js` - Card dealing
- `backend/src/game/scoring.js` - Scoring rules
- `backend/src/game/game.js` - Game state

**Multiplayer:**
- `backend/src/index.js` - Socket.IO events
- `frontend/src/store/gameStore.js` - State management

**Board UI:**
- `frontend/src/scenes/CribbageBoardScene.js` - Phaser rendering
- `frontend/src/screens/GameBoard.jsx` - Game container

## Next Steps

1. Add card discard UI
2. Implement hand counting phase
3. Add chat between players
4. Sound effects
5. Game replay/history
6. Mobile optimizations
7. Deploy to cloud

---

Questions? Check README.md for full documentation.
