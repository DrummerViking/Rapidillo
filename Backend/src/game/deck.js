// =============================================
// deck.js — Card deck management
// =============================================

// --- DECK SETTINGS ---

// the 4 suits in a standard deck of cards
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'];

// the 13 possible card values (A=1, J=11, Q=12, K=13)
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Visual tags to show on the card (for display purposes)
const VALUE_LABELS = {
  1:  'A',
  11: 'J',
  12: 'Q',
  13: 'K'
};

// =============================================
// FUNCTION 1: Create a new deck of 54 cards
// =============================================
function createDeck() {
  const deck = [];

  // Create the 52 standard cards (4 suits × 13 values)
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({
        id:      `${suit}-${value}`,   // Ex: "hearts-1"
        suit:    suit,                 // Ex: "hearts"
        value:   value,                // Ex: 1
        label:   VALUE_LABELS[value] || String(value), // Ex: "A", "7", "Q"
        isJoker: false,
        isWild:  value === 13,         // the King (value 13) is a wild card in this game
      });
    }
  }

  // add 2 jokers (wild cards with no suit or value)
  deck.push({ id: 'joker-1', suit: null, value: null, label: 'JOKER', isJoker: true, isWild: true });
  deck.push({ id: 'joker-2', suit: null, value: null, label: 'JOKER', isJoker: true, isWild: true });

  return deck; // returns an array of 54 card objects
}

// =============================================
// FUNCTION 2: Shuffle the deck (Fisher-Yates algorithm)
// =============================================
function shuffleDeck(deck) {
  const shuffled = [...deck]; // We create a copy of the deck to avoid mutating the original

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // swap elements at indices i and j
  }

  return shuffled;
}

// =============================================
// FUNCTION 3: Create game decks for the entire game
// (1 deck per player, all shuffled together)
// =============================================
function createGameDecks(numberOfPlayers) {
  let allCards = [];

  for (let i = 0; i < numberOfPlayers; i++) {
    const deck = createDeck();
    // we tag each card with the player number to keep track of which card belongs to which player
    const taggedDeck = deck.map(card => ({
      ...card,
      id: `p${i}-${card.id}` // Ex: "p0-hearts-1", "p1-hearts-1"
    }));
    allCards = allCards.concat(taggedDeck);
  }

  return shuffleDeck(allCards); // returns a single shuffled deck containing all players' cards (54 cards × numberOfPlayers)
}

// =============================================
// FUNCTION 4: Draw N cards from the deck
// =============================================
function drawCards(deck, amount) {
  const drawn = deck.splice(0, amount); // takes the first 'amount' cards from the deck and removes them from the original deck
  return { drawn, deck };               // returns an object with the drawn cards and the remaining deck
}

// --- Exporting the functions to be used in other modules (like player.js) ---
module.exports = {
  createDeck,
  shuffleDeck,
  createGameDecks,
  drawCards,
  VALUE_LABELS
};