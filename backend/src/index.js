import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { query } from './db.js';
import * as playersModel from './models/players.js';
import * as gamesModel from './models/games.js';
import { CribbageGame } from './game/game.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ===== Security Middleware =====

// Helmet for security headers
app.use(helmet());

// CORS with strict origin control
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Request size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: false }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests, please try again later.',
});

// Input validation helpers
const validateNickname = (nickname) => {
  if (!nickname || typeof nickname !== 'string') {
    throw new Error('Nickname required and must be a string');
  }
  const trimmed = nickname.trim();
  if (trimmed.length < 2 || trimmed.length > 50) {
    throw new Error('Nickname must be between 2-50 characters');
  }
  // Check for XSS patterns
  if (/<script|javascript:|on\w+=/i.test(trimmed)) {
    throw new Error('Nickname contains invalid characters');
  }
  return trimmed;
};

const validateGameCode = (gameCode) => {
  if (!gameCode || typeof gameCode !== 'string') {
    throw new Error('Game code required');
  }
  if (!/^[A-Z0-9]{6}$/.test(gameCode)) {
    throw new Error('Invalid game code format');
  }
  return gameCode.toUpperCase();
};

// Socket.IO with security configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  maxHttpBufferSize: 1e5, // 100 KB max
  pingInterval: 25000,
  pingTimeout: 60000,
});

// Store active games in memory
const activeGames = new Map();
const playerSockets = new Map();
const socketRateLimits = new Map();

// Socket.IO rate limiting
const checkSocketRateLimit = (socketId, eventName) => {
  const key = `${socketId}:${eventName}`;
  if (!socketRateLimits.has(key)) {
    socketRateLimits.set(key, { count: 0, resetTime: Date.now() + 60000 });
  }
  
  const now = Date.now();
  const limit = socketRateLimits.get(key);
  
  if (now > limit.resetTime) {
    socketRateLimits.set(key, { count: 0, resetTime: now + 60000 });
  }
  
  const current = socketRateLimits.get(key);
  current.count++;
  
  return current.count <= 50; // 50 events per minute per socket
};

// ===== API Routes =====

// Health check (no rate limit)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Create a new player
app.post('/api/players', strictLimiter, async (req, res) => {
  try {
    const nickname = validateNickname(req.body.nickname);
    const player = await playersModel.createPlayer(nickname);
    res.json(player);
  } catch (err) {
    console.error('Error creating player:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Get player stats
app.get('/api/players/:uuid/stats', async (req, res) => {
  try {
    const uuid = req.params.uuid;
    if (!uuid || typeof uuid !== 'string' || uuid.length !== 36) {
      return res.status(400).json({ error: 'Invalid UUID format' });
    }
    
    const player = await playersModel.getPlayerByUuid(uuid);
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    const stats = await playersModel.getPlayerStats(player.id);
    res.json(stats);
  } catch (err) {
    console.error('Error getting player stats:', err.message);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Create a new game
app.post('/api/games', strictLimiter, async (req, res) => {
  try {
    let { playerId } = req.body;
    
    // Accept either UUID or internal numeric ID
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }
    
    // If it's a UUID (string), look up the internal player ID
    if (typeof playerId === 'string' && playerId.length === 36) {
      const player = await playersModel.getPlayerByUuid(playerId);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      playerId = player.id;
    } else if (typeof playerId !== 'number') {
      return res.status(400).json({ error: 'Invalid player ID format' });
    }
    
    const game = await gamesModel.createGame(playerId);
    res.json(game);
  } catch (err) {
    console.error('Error creating game:', err.message);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Join a game
app.post('/api/games/:gameCode/join', strictLimiter, async (req, res) => {
  try {
    const gameCode = validateGameCode(req.params.gameCode);
    let { playerId } = req.body;
    
    // Accept either UUID or internal numeric ID
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }
    
    // If it's a UUID (string), look up the internal player ID
    if (typeof playerId === 'string' && playerId.length === 36) {
      const player = await playersModel.getPlayerByUuid(playerId);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      playerId = player.id;
    } else if (typeof playerId !== 'number') {
      return res.status(400).json({ error: 'Invalid player ID format' });
    }
    
    const game = await gamesModel.joinGame(gameCode, playerId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found or already full' });
    }
    res.json(game);
  } catch (err) {
    console.error('Error joining game:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Get game
app.get('/api/games/:gameCode', async (req, res) => {
  try {
    const gameCode = validateGameCode(req.params.gameCode);
    const game = await gamesModel.getGameByCode(gameCode);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (err) {
    console.error('Error getting game:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// ===== Socket.IO Events =====

io.on('connection', (socket) => {
  console.log(`✓ Client connected: ${socket.id}`);
  
  socket.on('join_game', async (data) => {
    try {
      if (!checkSocketRateLimit(socket.id, 'join_game')) {
        socket.emit('error', { message: 'Rate limit exceeded', code: 'RATE_LIMIT' });
        return;
      }

      const { gameCode, playerId } = data;
      
      // Validate inputs
      if (!gameCode || !playerId) {
        socket.emit('error', { message: 'Missing required fields', code: 'INVALID_DATA' });
        return;
      }

      const validGameCode = validateGameCode(gameCode);
      
      console.log(`→ Player ${playerId} joining game ${validGameCode}`);
      
      // Join socket room
      socket.join(validGameCode);
      socket.gameCode = validGameCode;
      socket.playerId = playerId;
      playerSockets.set(playerId, socket.id);
      
      // Get game from DB
      const dbGame = await gamesModel.getGameByCode(validGameCode);
      if (!dbGame) {
        socket.emit('error', { message: 'Game not found', code: 'NOT_FOUND' });
        return;
      }
      
      // Initialize game if not already
      if (!activeGames.has(validGameCode)) {
        const game = new CribbageGame(dbGame.player1_id, dbGame.player2_id);
        activeGames.set(validGameCode, game);
        console.log(`◆ Game ${validGameCode} initialized`);
      }
      
      const game = activeGames.get(validGameCode);
      socket.emit('game_state', game.getPublicGameState(playerId));
      socket.to(validGameCode).emit('opponent_joined', { playerId });
    } catch (err) {
      console.error('Error in join_game:', err.message);
      socket.emit('error', { message: err.message, code: 'ERROR' });
    }
  });
  
  socket.on('play_card', async (data) => {
    try {
      if (!checkSocketRateLimit(socket.id, 'play_card')) {
        socket.emit('error', { message: 'Rate limit exceeded', code: 'RATE_LIMIT' });
        return;
      }

      const { gameCode, playerId, cardIndex } = data;
      
      if (!socket.gameCode || gameCode !== socket.gameCode) {
        socket.emit('error', { message: 'Invalid game context', code: 'INVALID_CONTEXT' });
        return;
      }

      const game = activeGames.get(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Game not found', code: 'NOT_FOUND' });
        return;
      }
      
      const result = game.playCard(playerId, cardIndex);
      
      // Update game in DB
      const dbGame = await gamesModel.getGameByCode(gameCode);
      await gamesModel.updateGameState(
        dbGame.id,
        game.toJSON(),
        game.p1Score,
        game.p2Score,
        game.currentTurn
      );
      
      io.to(gameCode).emit('card_played', {
        playerId,
        score: result.score,
        totalInPlay: result.totalInPlay,
        gameState: game.getGameState(),
      });
      
      // Switch turn
      game.currentTurn = game.currentTurn === game.player1Id ? game.player2Id : game.player1Id;
      io.to(gameCode).emit('turn_changed', { currentTurn: game.currentTurn });
    } catch (err) {
      console.error('Error in play_card:', err.message);
      socket.emit('error', { message: err.message, code: 'ERROR' });
    }
  });
  
  socket.on('peg_move', async (data) => {
    try {
      if (!checkSocketRateLimit(socket.id, 'peg_move')) {
        socket.emit('error', { message: 'Rate limit exceeded', code: 'RATE_LIMIT' });
        return;
      }

      const { gameCode, playerId, fromPosition, toPosition, pointsAwarded } = data;
      
      if (!socket.gameCode || gameCode !== socket.gameCode) {
        socket.emit('error', { message: 'Invalid game context', code: 'INVALID_CONTEXT' });
        return;
      }

      // Ensure player can only move their own peg
      if (playerId !== socket.playerId) {
        socket.emit('error', { message: 'Unauthorized: cannot move opponent peg', code: 'UNAUTHORIZED' });
        return;
      }

      const game = activeGames.get(gameCode);
      if (!game) {
        socket.emit('error', { message: 'Game not found', code: 'NOT_FOUND' });
        return;
      }
      
      const validation = game.validatePegMove(playerId, fromPosition, toPosition, pointsAwarded);
      if (!validation.valid) {
        socket.emit('peg_move_invalid', validation);
        return;
      }
      
      const result = game.movePeg(playerId, toPosition);
      
      // Update game in DB
      const dbGame = await gamesModel.getGameByCode(gameCode);
      await gamesModel.updateGameState(
        dbGame.id,
        game.toJSON(),
        game.p1Score,
        game.p2Score,
        game.currentTurn
      );
      
      if (result.winner) {
        await gamesModel.finishGame(dbGame.id, result.winner, game.p1Score, game.p2Score);
      }
      
      io.to(gameCode).emit('peg_moved', {
        playerId,
        newPosition: toPosition,
        gameState: game.getGameState(),
      });
      
      if (result.winner) {
        io.to(gameCode).emit('game_finished', {
          winner: result.winner,
          p1Score: game.p1Score,
          p2Score: game.p2Score,
        });
      }
    } catch (err) {
      console.error('Error in peg_move:', err.message);
      socket.emit('error', { message: err.message, code: 'ERROR' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`✗ Client disconnected: ${socket.id}`);
    // Clean up player socket mapping
    if (socket.playerId) {
      playerSockets.delete(socket.playerId);
    }
  });

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error);
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n🎮 Cribbage server running on port ${PORT}`);
  console.log(`🔒 Security: Helmet + Rate Limiting + Input Validation enabled\n`);
});
