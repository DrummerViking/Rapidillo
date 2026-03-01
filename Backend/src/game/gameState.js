// =============================================
// gameState.js — Complete game state manager
// =============================================

const { createGameDecks, drawCards, shuffleDeck } = require('./deck');
const { createPlayer, refillHand, playFromHand, playFromPile, playFromDiscard, discardCard, checkWinner, getVisiblePileCards } = require('./player');
const { validateAction, canPlayOnStaircase, isStaircaseComplete, findMandatoryAce } = require('./gameRules');

// =============================================
// FUNCTION 1: Create a new game
//
// Initializes everything:
// - Shuffled deck (1 per player)
// - All players with their pile and hand
// - Empty staircases
// - Turn order (randomized by dice roll)
// =============================================
function createGame(gameId, playersInfo) {
  // playersInfo = [{ id: 'player-1', name: 'Juan' }, { id: 'player-2', name: 'Ana' }, ...]

  const numberOfPlayers = playersInfo.length;

  // --- Create and shuffle all decks together ---
  let sharedDeck = createGameDecks(numberOfPlayers);

  // --- Roll dice to determine turn order ---
  // Each player rolls a dice (1–6), highest goes first
  const diceRolls = playersInfo.map(p => ({
    ...p,
    roll: Math.floor(Math.random() * 6) + 1 // Random number between 1 and 6
  }));

  // Sort players by dice roll (highest first)
  // If two players roll the same number, re-roll for those players (handled in turnManager)
  diceRolls.sort((a, b) => b.roll - a.roll);

  // --- Create all players ---
  const players = [];
  for (const playerInfo of diceRolls) {
    const { player, remainingDeck } = createPlayer(playerInfo.id, playerInfo.name, sharedDeck);
    players.push({ ...player, diceRoll: playerInfo.roll });
    sharedDeck = remainingDeck; // Update the deck after dealing to each player
  }

  // --- Mark the first player as active ---
  players[0].isActive = true;

  // --- Build the initial game state ---
  const gameState = {
    gameId,                         // Unique game identifier
    players,                        // Array of all players (sorted by dice roll)
    currentPlayerIndex: 0,          // Index of the active player
    staircases: [],                 // All staircases on the table (starts empty)
    sharedDeck,                     // Remaining cards in the central deck
    status: 'playing',              // 'waiting' | 'playing' | 'finished'
    winner: null,                   // Winner player id (null until someone wins)
    turnNumber: 1,                  // Current turn count
    log: [],                        // History of actions (for debugging)
  };

  return gameState;
}

// =============================================
// FUNCTION 2: Get the active player
// =============================================
function getActivePlayer(gameState) {
  return gameState.players[gameState.currentPlayerIndex];
}

// =============================================
// FUNCTION 3: Process a player action
//
// This is the main function called on every player action.
// It validates, executes, and updates the game state.
//
// action = {
//   type: 'playCard' | 'discard',
//   cardId: string,
//   source: 'hand' | 'pile' | 'discard',
//   staircaseIndex: number (for playCard),
//   rowIndex: number (for discard),
//   assignedValue: number | null (for wilds)
// }
// =============================================
function processAction(gameState, playerId, action) {

  // --- Verify it's this player's turn ---
  const activePlayer = getActivePlayer(gameState);
  if (activePlayer.id !== playerId) {
    return { success: false, reason: 'It is not your turn.' };
  }

  // --- Validate the action against game rules ---
  const validation = validateAction(action, activePlayer, gameState.staircases);
  if (!validation.valid) {
    return { success: false, reason: validation.reason };
  }

  // --- Execute the action ---
  if (action.type === 'playCard') {
    gameState = executePlayCard(gameState, activePlayer, action);
  } else if (action.type === 'discard') {
    gameState = executeDiscard(gameState, activePlayer, action);
  }

  // --- Check if the active player has won ---
  const updatedPlayer = getActivePlayer(gameState);
  if (checkWinner(updatedPlayer)) {
    gameState.status = 'finished';
    gameState.winner = updatedPlayer.id;
    updatedPlayer.isWinner = true;
  }

  return { success: true, gameState };
}

// =============================================
// FUNCTION 4: Execute a "play card" action
// (internal — called from processAction)
// =============================================
function executePlayCard(gameState, player, action) {
  let card = null;

  // --- Remove the card from its source ---
  if (action.source === 'hand') {
    const result = playFromHand(player, action.cardId);
    card = result.card;
  } else if (action.source === 'pile') {
    const result = playFromPile(player);
    card = result.card;
  } else if (action.source === 'discard') {
    const result = playFromDiscard(player, action.rowIndex);
    card = result.card;
  }

  if (!card) return gameState; // Safety check

  // --- Place the card on the correct staircase ---
  if (card.value === 1 && !card.isWild) {
    // Ace always starts a NEW staircase
    gameState.staircases.push([card]);
  } else {
    // Add to the chosen staircase
    gameState.staircases[action.staircaseIndex].push(card);
  }

  // --- Check if the staircase is now complete ---
  const staircase = card.value === 1
    ? gameState.staircases[gameState.staircases.length - 1] // Newly created
    : gameState.staircases[action.staircaseIndex];

  if (isStaircaseComplete(staircase)) {
    gameState = handleCompletedStaircase(gameState, action.staircaseIndex);
  }

  // --- Log the action ---
  gameState.log.push({
    turn: gameState.turnNumber,
    playerId: player.id,
    action: 'playCard',
    cardId: card.id,
    cardLabel: card.label,
    source: action.source,
  });

  return gameState;
}

// =============================================
// FUNCTION 5: Execute a "discard" action
// (internal — called from processAction)
// Discarding ends the player's turn.
// =============================================
function executeDiscard(gameState, player, action) {

  // --- Discard the card ---
  discardCard(player, action.cardId, action.rowIndex, action.assignedValue || null);

  // --- Log the action ---
  gameState.log.push({
    turn: gameState.turnNumber,
    playerId: player.id,
    action: 'discard',
    cardId: action.cardId,
    rowIndex: action.rowIndex,
    assignedValue: action.assignedValue || null,
  });

  // --- End the turn and pass to the next player ---
  gameState = advanceTurn(gameState);

  return gameState;
}

// =============================================
// FUNCTION 6: Handle a completed staircase
//
// When a staircase reaches Q (12 cards):
// - Those cards are shuffled back into the shared deck
// - The staircase is removed from the table
// =============================================
function handleCompletedStaircase(gameState, staircaseIndex) {
  const completedCards = gameState.staircases[staircaseIndex];

  // Shuffle the completed cards back into the shared deck
  gameState.sharedDeck = shuffleDeck([...gameState.sharedDeck, ...completedCards]);

  // Remove the completed staircase from the table
  gameState.staircases.splice(staircaseIndex, 1);

  gameState.log.push({
    turn: gameState.turnNumber,
    action: 'staircaseCompleted',
    cardsReturned: completedCards.length,
  });

  return gameState;
}

// =============================================
// FUNCTION 7: Advance to the next player's turn
//
// - Marks current player as inactive
// - Moves to the next player (circular)
// - Refills the next player's hand to 5 cards
// - Marks the next player as active
// =============================================
function advanceTurn(gameState) {

  // --- Deactivate current player ---
  gameState.players[gameState.currentPlayerIndex].isActive = false;

  // --- Move to the next player (circular) ---
  gameState.currentPlayerIndex =
    (gameState.currentPlayerIndex + 1) % gameState.players.length;

  gameState.turnNumber++;

  // --- Refill the next player's hand ---
  const nextPlayer = gameState.players[gameState.currentPlayerIndex];
  const { player: refilledPlayer, sharedDeck: updatedDeck } =
    refillHand(nextPlayer, gameState.sharedDeck);

  gameState.players[gameState.currentPlayerIndex] = refilledPlayer;
  gameState.sharedDeck = updatedDeck;

  // --- Activate the next player ---
  gameState.players[gameState.currentPlayerIndex].isActive = true;

  return gameState;
}

// =============================================
// FUNCTION 8: Get a sanitized view of the game state
// for a specific player
//
// Visibility rules:
// - Own hand: fully visible (only to the owner)
// - Own pile: only visible cards (top card, plus next cards if top is a wild)
// - Other players' pile: only the top card
// - All discard rows: fully visible to everyone
// - All staircases: fully visible to everyone
// - Shared deck: only the count is visible
// =============================================
function getPlayerView(gameState, playerId) {
  const sanitizedPlayers = gameState.players.map(player => {
    if (player.id === playerId) {
      // Own player — show hand fully, but pile only shows visible cards
      return {
        id:           player.id,
        name:         player.name,
        isActive:     player.isActive,
        isWinner:     player.isWinner,
        diceRoll:     player.diceRoll,
        hand:         player.hand,                        // ✅ Full hand (only owner sees this)
        pileCount:    player.pile.length,                 // Total cards in pile
        pileVisible:  getVisiblePileCards(player),        // ✅ Top card(s) — owner only
        discardRows:  player.discardRows,                 // ✅ Fully visible
      };
    } else {
      // Other players — hide hand, show only top of pile
      return {
        id:           player.id,
        name:         player.name,
        isActive:     player.isActive,
        isWinner:     player.isWinner,
        diceRoll:     player.diceRoll,
        hand:         null,                               // ❌ Hidden
        handCount:    player.hand.length,                 // Only the count
        pileCount:    player.pile.length,                 // Total cards in pile
        pileVisible:  player.pile.length > 0              // ✅ Only the top card
                        ? [player.pile[0]]
                        : [],
        discardRows:  player.discardRows,                 // ✅ Fully visible
      };
    }
  });

  return {
    gameId:             gameState.gameId,
    status:             gameState.status,
    winner:             gameState.winner,
    turnNumber:         gameState.turnNumber,
    currentPlayerIndex: gameState.currentPlayerIndex,
    staircases:         gameState.staircases,
    sharedDeckCount:    gameState.sharedDeck.length,      // Only the count, never the cards
    players:            sanitizedPlayers,
  };
}

// --- EXPORT all functions ---
module.exports = {
  createGame,
  getActivePlayer,
  processAction,
  advanceTurn,
  getPlayerView,
};