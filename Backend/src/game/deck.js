// =============================================
// deck.js — El mazo de cartas
// =============================================

// --- CONFIGURACIÓN DEL MAZO ---

// Las 4 figuras del mazo
const SUITS = ['corazones', 'diamantes', 'treboles', 'picas'];

// Los 13 valores posibles (A=1, J=11, Q=12, K=13)
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

// Etiquetas visuales para mostrar en pantalla
const VALUE_LABELS = {
  1:  'A',
  11: 'J',
  12: 'Q',
  13: 'K'
};

// =============================================
// FUNCIÓN 1: Crear un mazo nuevo de 54 cartas
// =============================================
function createDeck() {
  const deck = [];

  // Creamos las 52 cartas normales (4 figuras x 13 valores)
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({
        id:      `${suit}-${value}`,   // Ej: "corazones-1"
        suit:    suit,                 // Ej: "corazones"
        value:   value,                // Ej: 1
        label:   VALUE_LABELS[value] || String(value), // Ej: "A", "7", "Q"
        isJoker: false,
        isWild:  value === 13,         // El K también es comodín
      });
    }
  }

  // Agregamos los 2 Jokers
  deck.push({ id: 'joker-1', suit: null, value: null, label: 'JOKER', isJoker: true, isWild: true });
  deck.push({ id: 'joker-2', suit: null, value: null, label: 'JOKER', isJoker: true, isWild: true });

  return deck; // Retorna un array de 54 cartas
}

// =============================================
// FUNCIÓN 2: Mezclar el mazo (algoritmo Fisher-Yates)
// =============================================
function shuffleDeck(deck) {
  const shuffled = [...deck]; // Copiamos el mazo para no modificar el original

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // Intercambiamos posiciones
  }

  return shuffled;
}

// =============================================
// FUNCIÓN 3: Crear mazos para toda la partida
// (1 mazo por jugador, todos mezclados juntos)
// =============================================
function createGameDecks(numberOfPlayers) {
  let allCards = [];

  for (let i = 0; i < numberOfPlayers; i++) {
    const deck = createDeck();
    // Le agregamos un prefijo al ID para que no se repitan entre mazos
    const taggedDeck = deck.map(card => ({
      ...card,
      id: `p${i}-${card.id}` // Ej: "p0-corazones-1", "p1-corazones-1"
    }));
    allCards = allCards.concat(taggedDeck);
  }

  return shuffleDeck(allCards); // Devuelve todos los mazos mezclados
}

// =============================================
// FUNCIÓN 4: Robar N cartas del mazo
// =============================================
function drawCards(deck, amount) {
  const drawn = deck.splice(0, amount); // Saca las primeras N cartas
  return { drawn, deck };               // Devuelve las cartas sacadas y el mazo restante
}

// --- EXPORTAMOS las funciones para usarlas en otros archivos ---
module.exports = {
  createDeck,
  shuffleDeck,
  createGameDecks,
  drawCards,
  VALUE_LABELS
};