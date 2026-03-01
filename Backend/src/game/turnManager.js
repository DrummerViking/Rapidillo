// =============================================
// turnManager.js — Turn flow manager
// =============================================

const { createGame, getActivePlayer, processAction, getPlayerView } = require('./gameState');
const { shuffleDeck } = require('./deck');
const { findMandatoryAce } = require('./gameRules');

// =============================================
// FUNCTION 1: Initialize a new game session
//
// Handles the full setup including:
// - Creating the game state
// - Resolving dice tie-breaks
// - Returning the initial view for each player
// =============================================
function initializeGame(gameId, playersInfo) {
  // playersInfo = [{ id: 'player-1', name: 'Juan' }, ...]

  // Validate player count (min 2, max 6)
  if (playersInfo.length < 2 || playersInfo.length > 6) {
    return {
      success: false,
      reason: `Invalid number of players. Must be between 2 and 6. Got: ${playersInfo.length}`
    };
  }

  // Create the game state (dice rolls happen inside createGame)
  let gameState = createGame(gameId, playersInfo);

  // Resolve dice tie-breaks if needed
  gameState = resolveDiceTies(gameState);

  // Build initial view for each player
  const playerViews = {};
  for (const player of gameState.players) {
    playerViews[player.id] = getPlayerView(gameState, player.id);
  }

  return {
    success: true,
    gameState,   // Full state (server only — never sent to clients directly)
    playerViews, // Sanitized views (each sent only to the corresponding player)
    turnOrder: gameState.players.map(p => ({ id: p.id, name: p.name, diceRoll: p.diceRoll }))
  };
}

// =============================================
// FUNCTION 2: Resolve dice tie-breaks
//
// If two or more players rolled the same number,
// they re-roll until there are no ties.
//
// Example:
// Player 1: 4, Player 2: 4, Player 3: 2
// → Players 1 and 2 re-roll
// → Player 1: 3, Player 2: 6
// → Final order: Player 2 (6), Player 1 (3), Player 3 (2) ... wait, Player 3 was 2
// → Actually re-sort all three: Player 2 (6), Player 1 (3 ... no wait)
// 
// Simpler: only tied players re-roll, then re-sort only among tied players
// keeping the relative order of non-tied players intact
// =============================================
function resolveDiceTies(gameState) {
  let hasTies = true;

  while (hasTies) {
    hasTies = false;

    // Group players by their dice roll value
    const rollGroups = {};
    for (const player of gameState.players) {
      if (!rollGroups[player.diceRoll]) rollGroups[player.diceRoll] = [];
      rollGroups[player.diceRoll].push(player);
    }

    // Check if any group has more than 1 player (= tie)
    for (const group of Object.values(rollGroups)) {
      if (group.length > 1) {
        hasTies = true;
        // Re-roll for all tied players
        for (const player of group) {
          player.diceRoll = Math.floor(Math.random() * 6) + 1;
        }
      }
    }

    // Re-sort all players by their dice roll (highest first)
    if (hasTies) {
      gameState.players.sort((a, b) => b.diceRoll - a.diceRoll);
    }
  }

  return gameState;
}

// =============================================
// FUNCTION 3: Handle a player action
//
// Main entry point called by the socket handler
// every time a player does something.
//
// Returns updated views for ALL players
// so the server can broadcast them.
// =============================================
function handlePlayerAction(gameState, playerId, action) {

  // --- Check if game is still active ---
  if (gameState.status !== 'playing') {
    return {
      success: false,
      reason: `Game is not active. Current status: ${gameState.status}`
    };
  }

  // --- Process the action through gameState ---
  const result = processAction(gameState, playerId, action);

  if (!result.success) {
    return { success: false, reason: result.reason };
  }

  gameState = result.gameState;

  // --- Check if the shared deck needs a reshuffle ---
  gameState = checkAndReshuffleDeck(gameState);

  // --- Build updated views for all players ---
  const playerViews = {};
  for (const player of gameState.players) {
    playerViews[player.id] = getPlayerView(gameState, player.id);
  }

  // --- Build the response ---
  const response = {
    success: true,
    gameState,    // Full state (server only)
    playerViews,  // Sanitized views per player
  };

  // --- If the game just ended, add winner info ---
  if (gameState.status === 'finished') {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    response.gameOver = true;
    response.winner = { id: winner.id, name: winner.name };
  }

  return response;
}

// =============================================
// FUNCTION 4: Check if the shared deck is empty
// and reshuffle if needed
//
// Edge case: if the deck runs out of cards,
// we cannot reshuffle discard rows (those belong to players).
// In this case the game continues but no cards can be drawn.
// Players must play from their hand, pile, or discard rows only.
// =============================================
function checkAndReshuffleDeck(gameState) {
  if (gameState.sharedDeck.length > 0) return gameState; // Deck is fine

  // Deck is empty — log it and flag the state
  gameState.log.push({
    turn: gameState.turnNumber,
    action: 'deckEmpty',
    message: 'The shared deck is empty. Players must continue with available cards.'
  });

  gameState.isDeckEmpty = true;

  return gameState;
}

// =============================================
// FUNCTION 5: Get the current turn summary
//
// Returns a human-readable summary of the current
// turn state — useful for the UI to display hints.
// =============================================
function getTurnSummary(gameState) {
  const activePlayer = getActivePlayer(gameState);
  const mandatoryAce = findMandatoryAce(activePlayer);

  return {
    activePlayerId:   activePlayer.id,
    activePlayerName: activePlayer.name,
    turnNumber:       gameState.turnNumber,
    handCount:        activePlayer.hand.length,
    pileCount:        activePlayer.pile.length,
    staircaseCount:   gameState.staircases.length,
    sharedDeckCount:  gameState.sharedDeck.length,
    isDeckEmpty:      gameState.isDeckEmpty || false,

    // Hint for the UI
    hint: mandatoryAce
      ? `⚠️ You must play your Ace before doing anything else!`
      : `Play a card or discard to end your turn.`
  };
}

// =============================================
// FUNCTION 6: Validate if the game can start
//
// Called before initializeGame to verify
// all pre-conditions are met.
// =============================================
function canStartGame(playersInfo) {
  if (!Array.isArray(playersInfo)) {
    return { valid: false, reason: 'Players info must be an array.' };
  }

  if (playersInfo.length < 2) {
    return { valid: false, reason: 'At least 2 players are required.' };
  }

  if (playersInfo.length > 6) {
    return { valid: false, reason: 'Maximum 6 players allowed.' };
  }

  // Check that all players have id and name
  for (const player of playersInfo) {
    if (!player.id || !player.name) {
      return { valid: false, reason: `Player is missing id or name: ${JSON.stringify(player)}` };
    }
  }

  // Check for duplicate player IDs
  const ids = playersInfo.map(p => p.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size !== ids.length) {
    return { valid: false, reason: 'Duplicate player IDs are not allowed.' };
  }

  return { valid: true };
}

// --- EXPORT all functions ---
module.exports = {
  initializeGame,
  resolveDiceTies,
  handlePlayerAction,
  checkAndReshuffleDeck,
  getTurnSummary,
  canStartGame
};