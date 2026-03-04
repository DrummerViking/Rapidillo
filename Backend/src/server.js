// =============================================
// server.js — Main server entry point
// =============================================

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const { roomHandler } = require('./sockets/roomHandler');
const { gameHandler } = require('./sockets/gameHandler');

const { register, login, verifyToken } = require('./db/auth');
const { getUserStats, getUserGameHistory, getLeaderboard } = require('./db/queries');


// =============================================
// SERVER SETUP
// =============================================
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for now (we'll restrict this in production)
    methods: ['GET', 'POST']
  }
});

// Parse incoming JSON requests
app.use(express.json());

// =============================================
// HEALTH CHECK ENDPOINT
// A simple route to verify the server is running.
// Open http://localhost:3000 in your browser to test.
// =============================================
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Rapidillo game server is running 🃏',
    timestamp: new Date().toISOString()
  });
});

// Add cors package
const cors = require('cors');

// Enable CORS for all origins (development only)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- Auth routes ---
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await register(username, email, password);

    if (!result.success) {
      return res.status(400).json({ error: result.reason });
    }

    res.status(201).json({
      message: 'Account created successfully!',
      user: result.user,
      token: result.token
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await login(username, password);

    if (!result.success) {
      return res.status(401).json({ error: result.reason });
    }

    res.json({
      message: 'Login successful!',
      user: result.user,
      token: result.token
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// --- Middleware to verify JWT token ---
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const result = verifyToken(token);

  if (!result.valid) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  req.userId = result.userId;
  req.username = result.username;
  next();
}

// --- Profile routes ---

// Get user stats
app.get('/profile/stats', authMiddleware, async (req, res) => {
  try {
    const stats = await getUserStats(req.userId);
    res.json({ stats });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get user game history
app.get('/profile/history', authMiddleware, async (req, res) => {
  try {
    const history = await getUserGameHistory(req.userId);
    res.json({ history });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get leaderboard (public — no auth required)
app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json({ leaderboard });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});
// =============================================
// SHARED GAME SESSIONS
//
// This object stores ALL active games in memory.
// Key:   gameId (string)
// Value: gameState (object from gameState.js)
//
// Example:
// {
//   'game-abc123': { gameId, players, staircases, ... },
//   'game-xyz789': { gameId, players, staircases, ... },
// }
// =============================================
const gameSessions = {};

// =============================================
// SOCKET.IO — CONNECTION HANDLER
//
// Every time a player connects, this block runs.
// 'socket' represents the individual player connection.
// =============================================
io.on('connection', (socket) => {
  console.log(`✅ Player connected: ${socket.id}`);

  // --- Attach room events (create/join a game room) ---
  roomHandler(socket, io, gameSessions);

  // --- Attach game events (play card, discard, etc.) ---
  gameHandler(socket, io, gameSessions);

  // --- Handle disconnection ---
  socket.on('disconnect', () => {
    console.log(`❌ Player disconnected: ${socket.id}`);
    // TODO: handle mid-game disconnections in a future phase
  });
});

// =============================================
// START THE SERVER
// =============================================
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});