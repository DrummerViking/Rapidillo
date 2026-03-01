// =============================================
// gameHandler.js — In-game events
// =============================================

const { handlePlayerAction, getTurnSummary } = require('../game/turnManager');

function gameHandler(socket, io, gameSessions) {

  // =============================================
  // EVENT: Player performs an action
  // (play a card or discard)
  //
  // Client sends:
  // {
  //   gameId: string,
  //   action: {
  //     type: 'playCard' | 'discard',
  //     cardId: string,
  //     source: 'hand' | 'pile' | 'discard',
  //     staircaseIndex: number,  (for playCard)
  //     rowIndex: number,        (for discard)
  //     assignedValue: number    (for wilds)
  //   }
  // }
  // =============================================
  socket.on('playerAction', ({ gameId, action }) => {
    const session = gameSessions[gameId];

    // Check if the game exists and is active
    if (!session || session.status !== 'playing') {
      socket.emit('error', { message: 'Game not found or not active.' });
      return;
    }

    // Process the action
    const result = handlePlayerAction(session.gameState, socket.id, action);

    if (!result.success) {
      // Send error only to the player who made the invalid action
      socket.emit('actionRejected', { reason: result.reason });
      return;
    }

    // Update the stored game state
    session.gameState = result.gameState;

    // Send each player their updated view
    for (const player of result.gameState.players) {
      const playerSocket = [...io.sockets.sockets.values()]
        .find(s => s.id === player.id);

      if (playerSocket) {
        playerSocket.emit('gameUpdated', {
          yourView: result.playerViews[player.id],
          turnSummary: getTurnSummary(result.gameState)
        });
      }
    }

    // If the game is over, broadcast the winner
    if (result.gameOver) {
      io.to(gameId).emit('gameOver', {
        winner: result.winner,
        message: `🏆 ${result.winner.name} wins!`
      });
      console.log(`🏆 Game over: ${gameId} — Winner: ${result.winner.name}`);
    }
  });

  // =============================================
  // EVENT: Player requests the current turn summary
  // (useful when reconnecting or refreshing)
  //
  // Client sends:  { gameId }
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

module.exports = { gameHandler };