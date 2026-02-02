# Development Guide

## Getting Started

### Prerequisites
- Node.js 20+ or Docker
- Git
- VS Code (recommended)

### Local Setup

1. **Clone and navigate to project**
```bash
cd /home/clawd/Share/projects/cribbage-multiplayer-game
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install
cd ../

# Frontend
cd frontend
npm install
cd ../
```

3. **Database setup**
```bash
# Using Docker (recommended)
docker-compose up -d postgres

# Wait for it to be ready
sleep 10

# Initialize schema
psql postgresql://cribbage:cribbage_dev_password@localhost:5432/cribbage_game < db/migrations/001_init_schema.sql
```

4. **Start services** (3 terminals)

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Terminal 3 - Database (if not Docker):
```bash
docker-compose up postgres
```

5. **Test**
- Open http://localhost:5173
- Create player and game
- Open another tab, join game
- Test gameplay

## Code Style

### JavaScript/React
- Use ES6 modules (`import`/`export`)
- Functional components + hooks
- Clear, descriptive variable names
- Comments for complex logic

### CSS
- CSS Modules for scoped styling
- Mobile-first approach
- Consistent spacing (multiples of 4px)
- Color system: Use defined colors

### Color Palette
```javascript
const colors = {
  bg: '#1a1a1a',
  surface: '#2a2a2a',
  border: '#3a3a3a',
  text: '#e5e5e5',
  textSecondary: '#999',
  primary: '#f59e0b',
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
};
```

## Key Development Tasks

### Adding a New API Endpoint

1. **Backend** (`backend/src/index.js`):
```javascript
app.get('/api/endpoint', async (req, res) => {
  try {
    // Logic here
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

2. **Frontend** (`frontend/src/api/client.js`):
```javascript
export async function myEndpoint(param) {
  const res = await client.get(`/api/endpoint/${param}`);
  return res.data;
}
```

3. **Use in component**:
```javascript
import { myEndpoint } from '../api/client';

const data = await myEndpoint(value);
```

### Adding a Socket.IO Event

1. **Backend listener** (`backend/src/index.js`):
```javascript
socket.on('my_event', async (data) => {
  // Process
  io.to(gameCode).emit('my_response', result);
});
```

2. **Frontend emit** (any component):
```javascript
const socket = useGameStore((s) => s.socket);
socket.emit('my_event', { ...data });
```

3. **Frontend listen**:
```javascript
useEffect(() => {
  socket.on('my_response', (data) => {
    // Handle
  });
  return () => socket.off('my_response');
}, [socket]);
```

### Adding a New Screen

1. **Create** `frontend/src/screens/MyScreen.jsx`:
```javascript
import React from 'react';
import useGameStore from '../store/gameStore';
import styles from './MyScreen.module.css';

export default function MyScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  
  return (
    <div className={styles.container}>
      {/* Content */}
    </div>
  );
}
```

2. **Create styles** `frontend/src/screens/MyScreen.module.css`

3. **Update App.jsx** to add navigation

4. **Update gameStore.js** if new state needed

### Modifying Game Rules

**Scoring changes** (`backend/src/game/scoring.js`):
```javascript
export function scoreNewRule(cards) {
  let score = 0;
  // Calculate
  return score;
}
```

**Game state changes** (`backend/src/game/game.js`):
```javascript
// Add to class
newMethod() {
  // Logic
}
```

### Database Changes

1. **Create migration** `db/migrations/002_add_feature.sql`
2. **Run it** `psql postgresql://... < db/migrations/002_add_feature.sql`
3. **Update models** if queries change

## Testing

### Manual Testing
1. Create game with player A
2. Join game with player B
3. Test each game phase
4. Verify scoring
5. Test edge cases

### Testing Checklist
- [ ] Player creation
- [ ] Game creation
- [ ] Game joining
- [ ] Card playing
- [ ] Scoring validation
- [ ] Peg movement
- [ ] Game completion
- [ ] Stats persistence
- [ ] Mobile responsiveness
- [ ] Error handling

### Debugging

**Frontend**
- Open DevTools (F12)
- Check Console for errors
- Check Network tab for API calls
- Check Application → Local Storage

**Backend**
- Check console logs
- Use `console.error()` for debugging
- Monitor database with: `psql postgresql://cribbage:cribbage_dev_password@localhost:5432/cribbage_game -c "SELECT * FROM games;"`

**Database**
```bash
# Connect
psql postgresql://cribbage:cribbage_dev_password@localhost:5432/cribbage_game

# Check tables
\dt

# View data
SELECT * FROM players;
SELECT * FROM games;

# Check indexes
\di
```

## Performance Optimization

### Frontend
- Code split screens with React.lazy()
- Memoize expensive components with React.memo()
- Use useCallback for event handlers
- Optimize images/assets

### Backend
- Add caching with Redis (future)
- Index database columns properly
- Use connection pooling (already done)
- Batch database queries

### Database
- Verify indexes are being used
- Analyze slow queries
- Archive old games

## Deployment

### Frontend Deployment (Vercel)
```bash
cd frontend
npm run build
# Upload dist/ to Vercel
```

### Backend Deployment (Railway/Heroku)
```bash
# Set environment variables
FRONTEND_URL=https://yourfrontend.com
DATABASE_URL=postgres://...

# Push to Git
git push origin main
# Deploys automatically
```

### Database (Managed PostgreSQL)
- Use managed service (AWS RDS, Heroku Postgres, etc.)
- Update DATABASE_URL connection string

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes, test
# ...

# Commit
git add .
git commit -m "feat: add my feature"

# Push
git push origin feature/my-feature

# Create pull request (if applicable)
```

## Common Issues

### Port Already in Use
```bash
# Kill process on port
lsof -i :5173
kill -9 <PID>

# Or use different port
PORT=5174 npm run dev
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Error
```bash
# Check if postgres is running
docker ps | grep postgres

# Restart if needed
docker-compose restart postgres

# Verify connection
psql postgresql://cribbage:cribbage_dev_password@localhost:5432/cribbage_game
```

### Socket.IO Not Connecting
- Check backend is running on 3001
- Check CORS settings in `backend/src/index.js`
- Check frontend URL in CORS origins
- Check browser console for errors

## Architecture Decisions

### Why Zustand?
- Lightweight state management
- No boilerplate
- Easy to learn
- Perfect for small-medium apps

### Why Phaser 3?
- Purpose-built for game rendering
- Excellent drag-drop support
- Active community
- Good mobile support

### Why Socket.IO?
- Perfect for turn-based games
- Automatic fallback to polling
- Room/namespace support
- Easy debugging

### Why PostgreSQL?
- Relational data fits cribbage game
- JSONB for flexible game state
- Excellent performance
- Easy to backup/scale

## Next Steps for Development

1. **Phase 2 - Card UI**
   - Render cards visually
   - Implement card selection
   - Add discard phase UI

2. **Phase 3 - Game Phases**
   - Full discard phase
   - Play phase UI
   - Hand counting UI
   - Crib counting

3. **Phase 4 - Features**
   - Chat between players
   - Game history/replay
   - Player statistics dashboard
   - Sound effects

4. **Phase 5 - Polish**
   - Animations
   - Mobile optimization
   - Performance tweaks
   - UX improvements

## Resources

- Phaser 3 Docs: https://photonstorm.github.io/phaser3-docs/
- Socket.IO: https://socket.io/docs/
- React: https://react.dev
- PostgreSQL: https://www.postgresql.org/docs/
- Cribbage Rules: https://www.wikihow.com/Play-Cribbage

---

*Happy coding! 🚀*
