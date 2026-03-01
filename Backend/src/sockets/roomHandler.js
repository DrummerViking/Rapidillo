// =============================================
// roomHandler.js — Room creation and joining
// =============================================

const { canStartGame, initializeGame } = require('../game/turnManager');

function roomHandler(socket, io, gameSessions) {

  // =============================================
  // EVENT: Create a new game room
  //
  // Client sends:  { gameId, playerName }
  // Server responds with: 'roomCreated' or 'error'
  // =============================================
  socket.on('createRoom', ({ gameId, playerName }) => {

    // Check if the room already exists
    if (gameSessions[gameId]) {
      socket.emit('error', { message: `Room "${gameId}" already exists.` });
      return;
    }

    // Store this player as the host of the pending room
    // (game hasn't started yet — we're waiting for more players)
    gameSessions[gameId] = {
      status: 'waiting',
      host: socket.id,
      players: [{ id: socket.id, name: playerName }]
    };

    // Join the socket room
    socket.join(gameId);

    console.log(`🏠 Room created: ${gameId} by ${playerName}`);

    // Confirm to the creator
    socket.emit('roomCreated', {
      gameId,
      message: `Room "${gameId}" created. Waiting for players...`,
      players: gameSessions[gameId].players
    });
  });

  // =============================================
  // EVENT: Join an existing room
  //
  // Client sends:  { gameId, playerName }
  // Server responds with: 'roomJoined' or 'error'
  // =============================================
  socket.on('joinRoom', ({ gameId, playerName }) => {
    const session = gameSessions[gameId];

    // Check if the room exists
    if (!session) {
      socket.emit('error', { message: `Room "${gameId}" does not exist.` });
      return;
    }

    // Check if the game already started
    if (session.status !== 'waiting') {
      socket.emit('error', { message: `Game "${gameId}" has already started.` });
      return;
    }

    // Check max players
    if (session.players.length >= 6) {
      socket.emit('error', { message: `Room "${gameId}" is full (max 6 players).` });
      return;
    }

    // Add the player to the session
    session.players.push({ id: socket.id, name: playerName });
    socket.join(gameId);

    console.log(`👤 ${playerName} joined room: ${gameId}`);

    // Notify everyone in the room
    io.to(gameId).emit('playerJoined', {
      gameId,
      playerName,
      players: session.players
    });
  });

  // =============================================
  // EVENT: Start the game (host only)
  //
  // Client sends:  { gameId }
  // Server responds with: 'gameStarted' or 'error'
  // =============================================
  socket.on('startGame', ({ gameId }) => {
    const session = gameSessions[gameId];

    // Check if the room exists
    if (!session) {
      socket.emit('error', { message: `Room "${gameId}" does not exist.` });
      return;
    }

    // Only the host can start the game
    if (session.host !== socket.id) {
      socket.emit('error', { message: 'Only the host can start the game.' });
      return;
    }

    // Validate player count
    const validation = canStartGame(session.players);
    if (!validation.valid) {
      socket.emit('error', { message: validation.reason });
      return;
    }

    // Initialize the game
    const result = initializeGame(gameId, session.players);
    if (!result.success) {
      socket.emit('error', { message: result.reason });
      return;
    }

    // Store the full game state (server only)
    gameSessions[gameId] = {
      ...session,
      status: 'playing',
      gameState: result.gameState
    };

    console.log(`🎮 Game started: ${gameId} with ${session.players.length} players`);
    console.log(`🎲 Turn order: ${result.turnOrder.map(p => `${p.name}(${p.diceRoll})`).join(' → ')}`);

    // Send each player their own sanitized view
    for (const player of result.gameState.players) {
      const playerSocket = [...io.sockets.sockets.values()]
        .find(s => s.id === player.id);

      if (playerSocket) {
        playerSocket.emit('gameStarted', {
          gameId,
          turnOrder: result.turnOrder,
          yourView: result.playerViews[player.id]
        });
      }
    }
  });
}

module.exports = { roomHandler };