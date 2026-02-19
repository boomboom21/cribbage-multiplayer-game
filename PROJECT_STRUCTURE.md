# Project Structure

## Directory Tree

```
cribbage-multiplayer-game/
├── docker-compose.yml           # Docker services configuration
├── .env                        # Environment variables
├── .env.example                # Example environment file
├── .gitignore                  # Git ignore rules
├── .codex.json                 # Codex configuration
├── README.md                   # Main documentation
├── QUICK_START.md              # Quick start guide
├── FEATURES.md                 # Features and status
├── PROJECT_STRUCTURE.md        # This file
│
├── db/                         # Database setup
│   └── migrations/
│       └── 001_init_schema.sql # Schema initialization
│
├── backend/                    # Express + Node.js server
│   ├── package.json            # Backend dependencies
│   ├── Dockerfile              # Docker image config
│   ├── .dockerignore           # Docker ignore rules
│   └── src/
│       ├── index.js            # Server entry point (Express + Socket.IO)
│       ├── db.js               # PostgreSQL connection pool
│       │
│       ├── models/             # Database models
│       │   ├── players.js      # Player queries
│       │   └── games.js        # Game queries
│       │
│       └── game/               # Cribbage game logic
│           ├── deck.js         # Card deck utilities
│           ├── scoring.js      # Scoring calculations
│           └── game.js         # Game state machine
│
└── frontend/                   # React + Vite application
    ├── package.json            # Frontend dependencies
    ├── Dockerfile              # Docker image config
    ├── .dockerignore           # Docker ignore rules
    ├── vite.config.js          # Vite configuration
    ├── index.html              # HTML entry point
    │
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Root component
        ├── index.css           # Global styles
        │
        ├── store/              # Zustand state management
        │   └── gameStore.js    # Global game state
        │
        ├── api/                # API client
        │   └── client.js       # Axios client & endpoints
        │
        ├── utils/              # Utility functions
        │   ├── socket.js       # Socket.IO helpers
        │   └── formatting.js   # String formatting
        │
        ├── screens/            # Page components
        │   ├── WelcomeScreen.jsx         # Nickname entry
        │   ├── WelcomeScreen.module.css
        │   ├── GameLobby.jsx             # Create/join game
        │   ├── GameLobby.module.css
        │   ├── GameBoard.jsx             # Game container
        │   └── GameBoard.module.css
        │
        ├── components/         # Reusable components
        │   ├── CribbageBoard.jsx         # Phaser board wrapper
        │   ├── Toast.jsx                 # Notification toast
        │   └── Toast.module.css
        │
        └── scenes/             # Phaser game scenes
            └── CribbageBoardScene.js     # Game board rendering
```

## Key Files Explained

### Backend

**`src/index.js`**
- Express server setup
- Socket.IO event handlers
- REST API endpoints
- Game state management

**`src/db.js`**
- PostgreSQL connection pool
- Query helper function

**`src/models/players.js`**
- Player creation/retrieval
- Player statistics
- UUID-based identification

**`src/models/games.js`**
- Game creation with code generation
- Game joining logic
- Game state persistence
- Game completion

**`src/game/deck.js`**
- Deck creation (52 cards)
- Shuffle algorithm
- Deal logic (6 per player)
- Card value lookup

**`src/game/scoring.js`**
- 15s detection (all combinations)
- Pairs/multi-pairs detection
- Runs detection (3-5 cards)
- Flush detection (4-5 points)
- Nibs detection (1 point)
- Play phase scoring

**`src/game/game.js`**
- `CribbageGame` class (main state machine)
- Phase management (deal, discard, play, counting)
- Turn management
- Card playing validation
- Peg movement validation
- Win condition checking

### Frontend

**`store/gameStore.js`**
- Global state using Zustand
- Screen navigation (welcome, lobby, game)
- Player info
- Game code
- Socket.IO connection
- Toast messages

**`api/client.js`**
- Axios HTTP client
- API endpoint wrappers
- Player creation/stats
- Game creation/joining

**`utils/socket.js`**
- Socket.IO connection factory
- Event listener setup
- Action emitters

**`screens/WelcomeScreen.jsx`**
- Nickname input form
- Player creation API call
- Welcome message + rules

**`screens/GameLobby.jsx`**
- Create game button
- Join game form
- Socket.IO connection setup

**`screens/GameBoard.jsx`**
- Phaser game board
- Socket.IO listeners
- Game state display
- Score tracking

**`components/CribbageBoard.jsx`**
- Phaser game wrapper
- Scene initialization
- State updates

**`scenes/CribbageBoardScene.js`**
- Phaser scene
- Board drawing (tracks, markings)
- Peg rendering
- Peg dragging logic
- Peg snapping to tracks
- Game state visualization

**`components/Toast.jsx`**
- Toast notification display
- Auto-dismiss after 3 seconds
- Success/error/info styling

### Database

**`db/migrations/001_init_schema.sql`**
- `players` table (id, uuid, nickname, created_at)
- `games` table (game_code, scores, status, game_state JSON)
- `game_moves` table (move history)
- Indexes for performance

## Data Flow

### Game Creation
```
User enters nickname
  ↓
POST /api/players
  ↓
Player created (UUID generated)
  ↓
User clicks "Create Game"
  ↓
POST /api/games
  ↓
Game created with 6-letter code
  ↓
Socket.IO connects
  ↓
emit join_game { gameCode, playerId }
  ↓
Game state synced to client
  ↓
Waiting for opponent
```

### Game Join
```
User enters game code
  ↓
POST /api/games/:gameCode/join
  ↓
Player2 added to game
  ↓
Game status → 'dealing'
  ↓
Socket.IO connects
  ↓
emit join_game { gameCode, playerId }
  ↓
Both players sync game state
  ↓
Game begins
```

### Gameplay
```
Player plays card
  ↓
emit play_card { gameCode, playerId, cardIndex }
  ↓
Backend validates & scores
  ↓
Game state updated in DB
  ↓
broadcast card_played { score, gameState }
  ↓
All clients update UI
```

### Peg Movement
```
Player drags peg
  ↓
Release mouse
  ↓
Calculate new position
  ↓
emit peg_move { fromPos, toPos, pointsAwarded }
  ↓
Backend validates: expectedPos = fromPos + pointsAwarded
  ↓
If valid:
  - Update game state in DB
  - broadcast peg_moved
  - Check for winner
  - If winner: broadcast game_finished
  ↓
If invalid:
  - broadcast peg_move_invalid
  - Client shows error toast
  - Peg returns to previous position
```

## Environment Variables

```
NODE_ENV=development          # Environment
DATABASE_URL=postgres://...   # DB connection string
PORT=3001                     # Backend port
FRONTEND_URL=http://...       # Frontend URL (for CORS)
VITE_API_URL=http://...       # API URL (for client)
```

## Database Schema

### players
```sql
id              SERIAL PRIMARY KEY
uuid            UUID UNIQUE NOT NULL
nickname        VARCHAR(255) NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
```

### games
```sql
id              SERIAL PRIMARY KEY
game_code       VARCHAR(6) UNIQUE NOT NULL
player1_id      INTEGER NOT NULL (FK players)
player2_id      INTEGER (FK players)
winner_id       INTEGER (FK players)
p1_score        INTEGER DEFAULT 0
p2_score        INTEGER DEFAULT 0
status          VARCHAR(50) DEFAULT 'waiting'
current_turn    INTEGER (FK players)
game_state      JSONB
created_at      TIMESTAMP DEFAULT NOW()
finished_at     TIMESTAMP
```

### game_moves
```sql
id              SERIAL PRIMARY KEY
game_id         INTEGER NOT NULL (FK games)
player_id       INTEGER NOT NULL (FK players)
move_type       VARCHAR(50) NOT NULL
move_data       JSONB
created_at      TIMESTAMP DEFAULT NOW()
```

## Dependencies

### Backend
- express@4.18.2
- socket.io@4.6.1
- pg@8.10.0
- uuid@9.0.0
- cors@2.8.5
- dotenv@16.3.1

### Frontend
- react@18.2.0
- react-dom@18.2.0
- phaser@3.55.2
- socket.io-client@4.6.1
- axios@1.6.0
- zustand@4.4.0
- vite@5.0.0
- @vitejs/plugin-react@4.1.0

## Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend | 3001 | http://localhost:3001 |
| Database | 5432 | postgresql://localhost:5432 |

## File Naming Conventions

- React components: PascalCase.jsx
- Styles: ComponentName.module.css
- Utility functions: camelCase.js
- Database models: camelCase.js
- Game logic: camelCase.js
- Screens: PascalCase.jsx

## Build & Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build
# Creates dist/ folder

# Backend
cd backend
npm install --production
# Ready for deployment
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Testing Checklist

- [ ] Local dev environment works
- [ ] Docker setup works
- [ ] Database initializes
- [ ] Create game works
- [ ] Join game works
- [ ] Socket.IO connects
- [ ] Game state syncs
- [ ] Peg movement works
- [ ] Scoring calculates
- [ ] Game finishes
- [ ] Stats persists

---

*Last Updated: Feb 2, 2026*
