// =============================================
// gameHandler.js — In-game events
// =============================================

const { handlePlayerAction, getTurnSummary } = require('../game/turnManager');
const { saveGame, saveGameParticipants, findUserByUsername } = require('../db/queries');

function gameHandler(socket, io, gameSessions) {

  // =============================================
  // EVENT: Player performs an action
  // =============================================
  socket.on('playerAction', async ({ gameId, action }) => {
    const session = gameSessions[gameId];

    if (!session || session.status !== 'playing') {
      socket.emit('error', { message: 'Game not found or not active.' });
      return;
    }

    const result = handlePlayerAction(session.gameState, socket.id, action);

    if (!result.success) {
      socket.emit('actionRejected', { reason: result.reason });
      return;
    }

    // Update stored game state
    session.gameState = result.gameState;

    // Send each player their updated view
    for (const player of result.gameState.players) {
      const playerSocket = [...io.sockets.sockets.values()]
        .find(s => s.id === player.id);

      if (playerSocket) {
        playerSocket.emit('gameUpdated', {
          yourView:    result.playerViews[player.id],
          turnSummary: getTurnSummary(result.gameState)
        });
      }
    }

    // =============================================
    // GAME OVER — save to database
    // =============================================
    if (result.gameOver) {
      console.log(`🏆 Game over: ${gameId} — Winner: ${result.winner.name}`);

      // Broadcast game over to all players
      io.to(gameId).emit('gameOver', {
        winner:     result.winner,
        message:    `🏆 ${result.winner.name} wins!`,
        turnCount:  result.gameState.turnNumber,
        finalStats: buildFinalStats(result.gameState),
      });

      // Save to database asynchronously
      try {
        await persistGameToDatabase(gameId, result.gameState, session);
        console.log(`✅ Game ${gameId} saved to database`);
      } catch (err) {
        console.error(`❌ Failed to save game ${gameId}:`, err.message);
      }

      // Mark session as finished
      session.status = 'finished';
    }
  });

  // =============================================
  // EVENT: Player requests turn summary
  // =============================================
  socket.on('requestTurnSummary', ({ gameId }) => {
    const session = gameSessions[gameId];

    if (!session || session.status !== 'playing') {
      socket.emit('error', { message: 'Game not found or not active.' });
      return;
    }

    socket.emit('turnSummary', getTurnSummary(session.gameState));
  });
}

// =============================================
// HELPER: Build final stats for ResultScreen
// =============================================
function buildFinalStats(gameState) {
  return gameState.players.map((player, index) => ({
    id:        player.id,
    name:      player.name,
    position:  player.isWinner ? 1 : index + 1,
    pileCount: player.pile.length,
    isWinner:  player.isWinner,
    diceRoll:  player.diceRoll,
  }));
}

// =============================================
// HELPER: Save the completed game to PostgreSQL
//
// Steps:
// 1. Find each player's user account (if logged in)
// 2. Save the game record
// 3. Save each participant's result
// =============================================
async function persistGameToDatabase(gameId, gameState, session) {
  // Step 1 — Try to match socket players to DB users
  // Players who played as guests won't have a DB user
  const playerUserMap = {};

  for (const player of gameState.players) {
    try {
      // session.players has the original { id, name } from lobby
      const dbUser = await findUserByUsername(player.name);
      if (dbUser) {
        playerUserMap[player.id] = dbUser.id;
      }
    } catch (err) {
      // Player not found in DB — they played as guest
      console.log(`Player "${player.name}" is a guest — not saving to DB`);
    }
  }

  // Step 2 — Find the winner's DB user ID
  const winner      = gameState.players.find(p => p.isWinner);
  const winnerDbId  = winner ? (playerUserMap[winner.id] || null) : null;

  // Step 3 — Save the game record
  const savedGame = await saveGame(
    gameId,
    gameState.players.length,
    winnerDbId,
    gameState.turnNumber
  );

  // Step 4 — Save each participant
  const participants = gameState.players.map((player, index) => ({
    userId:    playerUserMap[player.id] || null,
    diceRoll:  player.diceRoll,
    finalPile: player.pile.length,
    position:  player.isWinner ? 1 : index + 1,
  }));

  await saveGameParticipants(savedGame.id, participants);
}

module.exports = { gameHandler };