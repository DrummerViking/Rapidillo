// =============================================
// test.js — Quick game logic test
// (delete this file after testing)
// =============================================

const { canStartGame, initializeGame } = require('./src/game/turnManager');
const { getPlayerView }                = require('./src/game/gameState');
const { validateAction }               = require('./src/game/gameRules');

console.log('\n========================================');
console.log('🃏 RAPIDILLO — Game Logic Test');
console.log('========================================\n');

// =============================================
// TEST 1: Validate player count
// =============================================
console.log('--- TEST 1: Player count validation ---');

const tooFew  = canStartGame([{ id: 'p1', name: 'Juan' }]);
const valid   = canStartGame([{ id: 'p1', name: 'Juan' }, { id: 'p2', name: 'Ana' }]);
const tooMany = canStartGame([
  { id: 'p1', name: 'Juan' }, { id: 'p2', name: 'Ana' },
  { id: 'p3', name: 'Bob' },  { id: 'p4', name: 'Eva' },
  { id: 'p5', name: 'Leo' },  { id: 'p6', name: 'Mia' },
  { id: 'p7', name: 'Tom' }
]);

console.log('Too few players (1):', tooFew.valid === false ? '✅ Rejected correctly' : '❌ Should have been rejected');
console.log('Valid players (2):',   valid.valid   === true  ? '✅ Accepted correctly' : '❌ Should have been accepted');
console.log('Too many players (7):', tooMany.valid === false ? '✅ Rejected correctly' : '❌ Should have been rejected');

// =============================================
// TEST 2: Initialize a 2-player game
// =============================================
console.log('\n--- TEST 2: Initialize a 2-player game ---');

const playersInfo = [
  { id: 'player-1', name: 'Juan' },
  { id: 'player-2', name: 'Ana' }
];

const game = initializeGame('game-test-001', playersInfo);

console.log('Game initialized:', game.success ? '✅ Success' : '❌ Failed');
console.log('Turn order:', game.turnOrder.map(p => `${p.name} (rolled ${p.diceRoll})`).join(' → '));

// =============================================
// TEST 3: Verify initial state
// =============================================
console.log('\n--- TEST 3: Initial state verification ---');

const state   = game.gameState;
const player1 = state.players[0];
const player2 = state.players[1];

console.log(`${player1.name} — Hand: ${player1.hand.length} cards (expected 5):`, player1.hand.length === 5 ? '✅' : '❌');
console.log(`${player1.name} — Pile: ${player1.pile.length} cards (expected 21):`, player1.pile.length === 21 ? '✅' : '❌');
console.log(`${player2.name} — Hand: ${player2.hand.length} cards (expected 5):`, player2.hand.length === 5 ? '✅' : '❌');
console.log(`${player2.name} — Pile: ${player2.pile.length} cards (expected 21):`, player2.pile.length === 21 ? '✅' : '❌');

const totalCards = state.sharedDeck.length + 
  state.players.reduce((sum, p) => sum + p.hand.length + p.pile.length, 0);
const expectedTotal = 54 * playersInfo.length;
console.log(`Total cards accounted for: ${totalCards} (expected ${expectedTotal}):`, totalCards === expectedTotal ? '✅' : '❌');

// =============================================
// TEST 4: Player views (information hiding)
// =============================================
console.log('\n--- TEST 4: Player view sanitization ---');

const view1 = getPlayerView(state, 'player-1');
const view2 = getPlayerView(state, 'player-2');

const p1inView1 = view1.players.find(p => p.id === 'player-1');
const p2inView1 = view1.players.find(p => p.id === 'player-2');

console.log('Player 1 sees own hand:',          p1inView1.hand !== null ? '✅' : '❌');
console.log('Player 1 cannot see Player 2 hand:', p2inView1.hand === null ? '✅' : '❌');
console.log('Player 1 sees own pile (visible only):', Array.isArray(p1inView1.pileVisible) ? '✅' : '❌');
console.log('Player 1 sees Player 2 pile top only:', p2inView1.pileVisible.length <= 1 || p2inView1.pileVisible[0].isWild ? '✅' : '❌');

// =============================================
// TEST 5: Ace mandatory play rule
// =============================================
console.log('\n--- TEST 5: Ace mandatory rule ---');

// Manually inject an Ace into player 1's hand to test
const fakeAce = { id: 'test-ace', suit: 'hearts', value: 1, label: 'A', isJoker: false, isWild: false };
const playerWithAce = { ...player1, hand: [fakeAce, ...player1.hand] };

const discardAction = {
  type: 'discard',
  cardId: player1.hand[0].id, // Try to discard a non-ace card
  rowIndex: 0
};

const validation = validateAction(discardAction, playerWithAce, state.staircases);
console.log('Cannot discard while holding an Ace:', validation.valid === false ? '✅ Correctly blocked' : '❌ Should have been blocked');
console.log('Reason:', validation.reason);

// =============================================
// TEST 6: Discard an Ace directly
// =============================================
console.log('\n--- TEST 6: Cannot discard an Ace ---');

const discardAceAction = {
  type: 'discard',
  cardId: fakeAce.id,
  rowIndex: 0
};

const aceDiscardValidation = validateAction(discardAceAction, playerWithAce, state.staircases);
console.log('Cannot discard an Ace directly:', aceDiscardValidation.valid === false ? '✅ Correctly blocked' : '❌ Should have been blocked');
console.log('Reason:', aceDiscardValidation.reason);

// =============================================
// SUMMARY
// =============================================
console.log('\n========================================');
console.log('🏁 Test complete!');
console.log('========================================\n');