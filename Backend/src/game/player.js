// =============================================
// player.js — The player
// =============================================

const { drawCards } = require('./deck');

// =============================================
// FUNCTION 1: Create a new player
// =============================================
function createPlayer(playerId, playerName, sharedDeck) {

  // Deal the pile: 21 cards
  const { drawn: pileCards, deck: remainingDeck } = drawCards(sharedDeck, 21);

  // Deal the initial hand: 5 cards
  const { drawn: handCards, deck: finalDeck } = drawCards(remainingDeck, 5);

  const player = {
    id:       playerId,    // Unique identifier. Ex: "player-1"
    name:     playerName,  // Display name.      Ex: "Juan"

    // Hand: only visible to the owner
    hand: handCards,       // Array of 5 cards

    // Pile: 21 cards (stack - LIFO)
    // The top card (index 0) is always visible to all players
    // If the top card is a wild, the next card is also revealed, and so on
    pile: pileCards,

    // 4 discard rows (LIFO: last in, first out)
    // Each row is an empty array at the start
    discardRows: [[], [], [], []],

    // Player status
    isWinner: false,  // Did this player win?
    isActive: false,  // Is it this player's turn?
  };

  // Return the created player AND the remaining deck (without the dealt cards)
  return { player, remainingDeck: finalDeck };
}

// =============================================
// FUNCTION 2: Refill hand at the start of a turn
// (draws cards until hand has 5)
// =============================================
function refillHand(player, sharedDeck) {
  const cardsNeeded = 5 - player.hand.length;

  if (cardsNeeded <= 0) return { player, sharedDeck }; // Already has 5 cards

  const { drawn, deck: remainingDeck } = drawCards(sharedDeck, cardsNeeded);

  player.hand = [...player.hand, ...drawn];

  return { player, sharedDeck: remainingDeck };
}

// =============================================
// FUNCTION 3: Get the top card of the pile
// (the card that can be played)
// Always returns the card at index 0
// =============================================
function getTopOfPile(player) {
  if (player.pile.length === 0) return null; // Pile is empty — player won!
  return player.pile[0];
}

// =============================================
// FUNCTION 4: Get all visible cards from the pile
// 
// Rule: if the top card is a wild (Joker or K),
// the next card is also revealed.
// This repeats until a non-wild card is found.
//
// Example pile: [JOKER, K, 7, 3, ...]
// Visible cards: [JOKER, K, 7]  ← stops at 7 (not a wild)
// =============================================
function getVisiblePileCards(player) {
  const visible = [];

  for (let i = 0; i < player.pile.length; i++) {
    const card = player.pile[i];
    visible.push(card);

    // If this card is NOT a wild, stop here
    if (!card.isWild) break;

    // If this card IS a wild, continue to the next card
  }

  return visible; // Array of visible cards (at least 1, could be more)
}

// =============================================
// FUNCTION 5: Play the top card from the pile
// (removes it and returns it to be played)
// =============================================
function playFromPile(player) {
  if (player.pile.length === 0) return { card: null, player };

  const card = player.pile.shift(); // Removes the top card (index 0)
  return { card, player };
}

// =============================================
// FUNCTION 6: Play a card from the hand
// =============================================
function playFromHand(player, cardId) {
  const cardIndex = player.hand.findIndex(c => c.id === cardId);

  if (cardIndex === -1) return { card: null, player }; // Card not found in hand

  const [card] = player.hand.splice(cardIndex, 1);
  return { card, player };
}

// =============================================
// FUNCTION 7: Play the top card from a discard row
// =============================================
function playFromDiscard(player, rowIndex) {
  if (rowIndex < 0 || rowIndex > 3) return { card: null, player }; // Invalid row

  const row = player.discardRows[rowIndex];
  if (row.length === 0) return { card: null, player }; // Empty row

  const card = row[row.length - 1];                    // Top card (LIFO)
  player.discardRows[rowIndex] = row.slice(0, -1);     // Remove it from the row

  return { card, player };
}

// =============================================
// FUNCTION 8: Discard a card to a row
// The card can ONLY come from the player's hand.
// Discarding from the pile is NOT allowed.
// If the card is a wild, an assignedValue can be set (2–12)
// =============================================
function discardCard(player, cardId, rowIndex, assignedValue = null) {

  // Search for the card in hand only
  const handIndex = player.hand.findIndex(c => c.id === cardId);

  if (handIndex === -1) return { success: false, player }; // Card not found in hand

  const [card] = player.hand.splice(handIndex, 1);

  // If it's a wild and an assignedValue was provided, store it
  if (card.isWild && assignedValue !== null) {
    card.assignedValue = assignedValue;
  }

  // Push to the top of the chosen row (LIFO)
  player.discardRows[rowIndex].push(card);

  return { success: true, player };
}

// =============================================
// FUNCTION 9: Check if the player has won
// (pile is empty)
// =============================================
function checkWinner(player) {
  return player.pile.length === 0;
}

// --- EXPORT all functions ---
module.exports = {
  createPlayer,
  refillHand,
  getTopOfPile,
  getVisiblePileCards,
  playFromPile,
  playFromHand,
  playFromDiscard,
  discardCard,
  checkWinner
};