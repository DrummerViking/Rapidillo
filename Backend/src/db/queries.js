// =============================================
// queries.js — All database queries
// =============================================

const { query } = require('./db');
const bcrypt    = require('bcryptjs');

// =============================================
// USER QUERIES
// =============================================

// Create a new user account
async function createUser(username, email, password) {
  // Hash the password before storing it
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (username, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, username, email, created_at`,
    [username, email, passwordHash]
  );

  return result.rows[0];
}

// Find a user by username
async function findUserByUsername(username) {
  const result = await query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );
  return result.rows[0] || null;
}

// Find a user by ID
async function findUserById(id) {
  const result = await query(
    `SELECT id, username, email, created_at, last_login
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

// Update last login timestamp
async function updateLastLogin(userId) {
  await query(
    `UPDATE users SET last_login = NOW() WHERE id = $1`,
    [userId]
  );
}

// Verify a password against its hash
async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(plainPassword, passwordHash);
}

// =============================================
// GAME QUERIES
// =============================================

// Save a completed game to the database
async function saveGame(gameId, playerCount, winnerId, turnCount) {
  const result = await query(
    `INSERT INTO games (game_id, player_count, winner_id, turn_count, finished_at)
     VALUES ($1, $2, $3, $4, NOW())
     RETURNING id`,
    [gameId, playerCount, winnerId, turnCount]
  );
  return result.rows[0];
}

// Save all participants of a game
async function saveGameParticipants(gameDbId, participants) {
  // participants = [{ userId, diceRoll, finalPile, position }, ...]
  for (const p of participants) {
    await query(
      `INSERT INTO game_participants
         (game_id, user_id, dice_roll, final_pile, position)
       VALUES ($1, $2, $3, $4, $5)`,
      [gameDbId, p.userId, p.diceRoll, p.finalPile, p.position]
    );
  }
}

// Get a user's game history
async function getUserGameHistory(userId, limit = 10) {
  const result = await query(
    `SELECT
       g.game_id,
       g.player_count,
       g.turn_count,
       g.started_at,
       g.finished_at,
       u.username AS winner_name,
       gp.position,
       gp.final_pile
     FROM game_participants gp
     JOIN games g ON g.id = gp.game_id
     LEFT JOIN users u ON u.id = g.winner_id
     WHERE gp.user_id = $1
     ORDER BY g.finished_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

// Get overall user stats
async function getUserStats(userId) {
  const result = await query(
    `SELECT
       COUNT(*)                                          AS games_played,
       COUNT(*) FILTER (WHERE gp.position = 1)          AS games_won,
       ROUND(
         COUNT(*) FILTER (WHERE gp.position = 1)::numeric
         / NULLIF(COUNT(*), 0) * 100, 1
       )                                                 AS win_rate,
       MIN(g.turn_count)                                 AS best_game_turns,
       ROUND(AVG(g.turn_count), 1)                       AS avg_turns
     FROM game_participants gp
     JOIN games g ON g.id = gp.game_id
     WHERE gp.user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

// Get the global leaderboard (top 10 players by win rate)
async function getLeaderboard() {
  const result = await query(
    `SELECT
       u.username,
       COUNT(*)                                         AS games_played,
       COUNT(*) FILTER (WHERE gp.position = 1)         AS games_won,
       ROUND(
         COUNT(*) FILTER (WHERE gp.position = 1)::numeric
         / NULLIF(COUNT(*), 0) * 100, 1
       )                                                AS win_rate
     FROM game_participants gp
     JOIN users u ON u.id = gp.user_id
     JOIN games g ON g.id = gp.game_id
     GROUP BY u.id, u.username
     HAVING COUNT(*) >= 3
     ORDER BY win_rate DESC, games_won DESC
     LIMIT 10`
  );
  return result.rows;
}

module.exports = {
  // Users
  createUser,
  findUserByUsername,
  findUserById,
  updateLastLogin,
  verifyPassword,
  // Games
  saveGame,
  saveGameParticipants,
  getUserGameHistory,
  getUserStats,
  getLeaderboard,
};