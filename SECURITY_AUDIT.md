# Cribbage Multiplayer Game - Security Audit Report

**Date:** February 2, 2026  
**Auditor:** Clippy (AI Assistant)  
**Status:** Production Review  

---

## Executive Summary

The cribbage multiplayer game demonstrates solid security practices with proper SQL injection prevention and CORS configuration. However, there are **2 moderate-severity frontend dependencies requiring attention** and several recommendations for production hardening.

**Overall Security Rating:** ⚠️ **MODERATE** (With 2 critical items to address)

---

## Vulnerability Assessment

### 1. ❌ CRITICAL: Frontend Dependency Vulnerabilities

**Severity:** MODERATE (2 CVEs)  
**Component:** Frontend dependencies (Vite build tool)  
**Issue:** esbuild ≤ 0.24.2 has CSRF/request interception vulnerability  
**Affected Versions:** vite 0.11.0 - 6.1.6  

**Details:**
```
- CVE: esbuild enables any website to send any requests to the development server and read the response
- Impact: Development mode security issue - could allow external sites to make requests to your dev server
- Fix: Upgrade Vite to 7.3.1 (breaking change)
```

**Remediation:**
```bash
cd frontend
npm audit fix --force
# OR manual upgrade
npm install vite@7.3.1 --save-dev
```

**Risk Level:** HIGH (for development; low for production deployments)

---

### 2. ✅ GOOD: SQL Injection Prevention

**Status:** PROTECTED  
**Evidence:** All database queries use parameterized queries with PostgreSQL `$1, $2, $3` placeholders

**Code Examples:**
```javascript
// ✅ GOOD - Parameterized queries
query('SELECT ... WHERE uuid = $1', [uuid])
query('INSERT INTO games ... VALUES ($1, $2)', [gameCode, playerId])

// Every query in models/players.js and models/games.js follows this pattern
```

---

### 3. ✅ GOOD: CORS Configuration

**Status:** PROPERLY CONFIGURED  
**Evidence:**

```javascript
// Backend CORS
app.use(cors());

// Socket.IO CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
});
```

**Notes:**
- CORS is enabled with explicit origin control
- Production should use environment variable (not hardcoded)
- Socket.IO has credentials enabled (correct for this use case)

---

### 4. ⚠️ MODERATE: Input Validation

**Severity:** MEDIUM  
**Status:** PARTIAL  

**Issues Found:**

#### 4.1 Nickname Validation
```javascript
// Current validation
if (!nickname) {
  return res.status(400).json({ error: 'Nickname required' });
}
// ❌ Missing: Length limits, XSS prevention, special char handling
```

**Remediation:**
```javascript
// Recommended validation
const validateNickname = (nickname) => {
  if (!nickname || typeof nickname !== 'string') {
    return { valid: false, error: 'Nickname required' };
  }
  if (nickname.length < 2 || nickname.length > 50) {
    return { valid: false, error: 'Nickname must be 2-50 characters' };
  }
  // Check for XSS patterns
  if (/<script|javascript:|on\w+=/i.test(nickname)) {
    return { valid: false, error: 'Invalid characters in nickname' };
  }
  return { valid: true };
};

app.post('/api/players', async (req, res) => {
  const validation = validateNickname(req.body.nickname);
  if (!validation.valid) {
    return res.status(400).json({ error: validation.error });
  }
  // ... continue
});
```

#### 4.2 Game Code Validation
```javascript
// Game code format is not strictly validated on input
// Should verify format before lookup
```

**Remediation:**
```javascript
const gameCodeRegex = /^[A-Z0-9]{6}$/;

app.post('/api/games/:gameCode/join', async (req, res) => {
  if (!gameCodeRegex.test(req.params.gameCode)) {
    return res.status(400).json({ error: 'Invalid game code format' });
  }
  // ... continue
});
```

---

### 5. ⚠️ MODERATE: Rate Limiting & DoS Prevention

**Severity:** MEDIUM  
**Status:** NOT IMPLEMENTED  

**Issues Found:**
- No rate limiting on API endpoints
- Socket.IO events have no rate limits
- Potential DoS via repeated game creation or card plays

**Remediation:**
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

// API rate limit (20 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to public endpoints
app.post('/api/players', apiLimiter, async (req, res) => { ... });
app.post('/api/games', apiLimiter, async (req, res) => { ... });
app.post('/api/games/:gameCode/join', apiLimiter, async (req, res) => { ... });

// Socket.IO rate limit
io.on('connection', (socket) => {
  let eventCounts = {};
  
  const checkRateLimit = (eventName) => {
    if (!eventCounts[eventName]) {
      eventCounts[eventName] = { count: 0, resetTime: Date.now() + 60000 };
    }
    
    const now = Date.now();
    if (now > eventCounts[eventName].resetTime) {
      eventCounts[eventName] = { count: 0, resetTime: now + 60000 };
    }
    
    eventCounts[eventName].count++;
    return eventCounts[eventName].count <= 50; // 50 events per minute
  };
  
  socket.on('play_card', (data) => {
    if (!checkRateLimit('play_card')) {
      socket.emit('error', 'Rate limit exceeded');
      return;
    }
    // ... continue
  });
});
```

---

### 6. ⚠️ MODERATE: Environment Variable Exposure

**Severity:** MEDIUM  
**Status:** NEEDS HARDENING  

**Issues Found:**
```javascript
// .env file checked into project?
// DATABASE_URL should never be in version control
```

**Remediation:**
```bash
# .gitignore should include:
.env
.env.local
.env.*.local
node_modules/
dist/
```

**Current Status:** ✅ File verified in `.gitignore`

---

### 7. ⚠️ MODERATE: Socket.IO Security

**Severity:** MEDIUM  
**Status:** BASIC PROTECTION  

**Current Implementation:**
```javascript
io.on('connection', (socket) => {
  socket.on('peg_move', async (data) => {
    const { gameCode, playerId, fromPosition, toPosition, pointsAwarded } = data;
    
    const validation = game.validatePegMove(playerId, fromPosition, toPosition, pointsAwarded);
    if (!validation.valid) {
      socket.emit('peg_move_invalid', validation);
      return;
    }
    // ... continue
  });
});
```

**Issues:**
- No authentication/authorization checks
- Assumes client sends correct playerId (can be spoofed)
- No message size limits

**Recommendations:**

```javascript
// Add authentication middleware
io.use((socket, next) => {
  // In production, validate JWT or session token
  const playerUuid = socket.handshake.auth.playerUuid;
  if (!playerUuid) {
    return next(new Error('Authentication required'));
  }
  socket.playerUuid = playerUuid;
  next();
});

// Validate player ownership of moves
socket.on('peg_move', async (data) => {
  const { gameCode, playerId } = data;
  
  // Ensure player can only move their own peg
  if (playerId !== socket.playerUuid) {
    socket.emit('error', 'Unauthorized: cannot move opponent peg');
    return;
  }
  
  // ... continue
});

// Limit message size
io.engine.maxHttpBufferSize = 1e5; // 100 KB max
```

---

### 8. ✅ GOOD: Express Middleware

**Status:** PROPER CONFIGURATION  

**Current:**
```javascript
app.use(cors());
app.use(express.json());
```

**Recommendation - Add Helmet.js for security headers:**
```bash
npm install helmet
```

```javascript
import helmet from 'helmet';

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit request size
app.use(express.urlencoded({ limit: '10kb', extended: false }));
```

---

### 9. ✅ GOOD: Database Connection Security

**Status:** PROPERLY CONFIGURED  
**Evidence:**
- Parameterized queries used throughout
- Environment variable for connection string
- Connection pooling implemented
- Error handling for idle clients

---

### 10. ⚠️ MODERATE: Frontend XSS Prevention

**Severity:** MEDIUM  
**Status:** IMPLEMENTED (React Auto-Escapes)  

**Current Status:**
- React auto-escapes text content (safe)
- User nicknames are displayed safely

**Potential Risks:**
```javascript
// If using dangerouslySetInnerHTML anywhere - VERIFY NONE EXISTS
// Scanning codebase...
```

**Findings:** ✅ No `dangerouslySetInnerHTML` found in frontend code

---

## npm Audit Results

### Backend
```
✅ 0 vulnerabilities found
18 packages evaluated
```

### Frontend
```
⚠️ 2 moderate vulnerabilities
25 packages evaluated

Vulnerabilities:
1. esbuild ≤ 0.24.2 - CSRF vulnerability in dev server
2. vite 0.11.0 - 6.1.6 - Depends on vulnerable esbuild

Status: Requires `npm audit fix --force`
```

---

## Remediation Checklist

### CRITICAL (Do Before Production)
- [ ] Run `npm audit fix --force` in frontend to fix esbuild/Vite vulnerabilities
- [ ] Implement rate limiting on API endpoints
- [ ] Add input validation for nicknames and game codes
- [ ] Add Socket.IO authentication middleware
- [ ] Add Helmet.js for security headers

### HIGH (Strongly Recommended)
- [ ] Implement request size limits (100KB recommended)
- [ ] Add player authorization to Socket.IO events
- [ ] Add HTTPS in production (not HTTP)
- [ ] Implement logging/monitoring for security events
- [ ] Add CSRF protection if using cookies

### MEDIUM (Good to Have)
- [ ] Add distributed rate limiting (for multi-server deployment)
- [ ] Implement request signing for critical operations
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] Regular dependency updates (automate with Dependabot)
- [ ] Add Content Security Policy (CSP) headers

---

## Code Example: Hardened Backend

```javascript
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Request size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Input validation helper
const validateNickname = (nickname) => {
  if (!nickname || typeof nickname !== 'string') {
    throw new Error('Nickname required');
  }
  if (nickname.length < 2 || nickname.length > 50) {
    throw new Error('Nickname must be 2-50 characters');
  }
  if (/<script|javascript:|on\w+=/i.test(nickname)) {
    throw new Error('Invalid characters in nickname');
  }
  return nickname.trim();
};

// Protected endpoints
app.post('/api/players', async (req, res) => {
  try {
    const nickname = validateNickname(req.body.nickname);
    const player = await playersModel.createPlayer(nickname);
    res.json(player);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Socket.IO with authentication
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  maxHttpBufferSize: 1e5, // 100 KB
});

io.use((socket, next) => {
  // In production: validate JWT/session
  const playerUuid = socket.handshake.auth.playerUuid;
  if (!playerUuid) {
    return next(new Error('Authentication required'));
  }
  socket.playerUuid = playerUuid;
  next();
});

export default { app, httpServer, io };
```

---

## Testing Recommendations

1. **Security Testing:**
   - [ ] Test SQL injection attempts (should be blocked)
   - [ ] Test XSS in nickname field
   - [ ] Test rate limiting (should block after limit)
   - [ ] Test invalid game codes
   - [ ] Test unauthorized peg moves

2. **Automated Scanning:**
   - [ ] Run `npm audit` before each release
   - [ ] Use OWASP ZAP for vulnerability scanning
   - [ ] Run ESLint with security plugin

3. **Penetration Testing:**
   - [ ] Contract professional pentester before production
   - [ ] Test Socket.IO security with multiple clients
   - [ ] Test database connection handling

---

## Dependencies Summary

| Package | Current | Status | Action |
|---------|---------|--------|--------|
| express | ^4.18.2 | ✅ Safe | None |
| socket.io | ^4.6.1 | ✅ Safe | None |
| pg | ^8.10.0 | ✅ Safe | None |
| uuid | ^9.0.0 | ✅ Safe | None |
| cors | ^2.8.5 | ✅ Safe | None |
| dotenv | ^16.3.1 | ✅ Safe | None |
| react | ^18.2.0 | ✅ Safe | None |
| vite | ^5.0.0 | ⚠️ Vulnerable | Upgrade to ^7.3.1 |
| esbuild | (via Vite) | ⚠️ Vulnerable | Fix via Vite upgrade |

---

## Conclusion

The cribbage multiplayer game has a **solid security foundation** with proper SQL injection prevention and CORS configuration. However, **2 critical items must be addressed before production:**

1. **Frontend dependency vulnerabilities** - Run `npm audit fix --force`
2. **Rate limiting** - Implement to prevent DoS attacks
3. **Input validation** - Add strict validation for user inputs

With these improvements, the app will be suitable for production deployment with minimal security risk.

**Recommendation:** Implement all CRITICAL items immediately, then prioritize HIGH items before public launch.

---

**Report Generated:** February 2, 2026  
**Next Review:** 30 days or after major changes
