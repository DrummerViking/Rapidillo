// =============================================
// test-game.js — Simulates a complete game
// Run with: node test-game.js
// =============================================

const { initializeGame, handlePlayerAction } = require('../src/game/turnManager');
const { saveGame, saveGameParticipants }     = require('../src/db/queries');

require('dotenv').config();

async function simulateGame() {
  console.log('\n========================================');
  console.log('🃏 Simulating a complete game...');
  console.log('========================================\n');

  // Create a 2-player game
  const players = [
    { id: 'player-1', name: 'testuser' },
    { id: 'player-2', name: 'guest-player' },
  ];

  const result = initializeGame('test-game-001', players);
  if (!result.success) {
    console.error('❌ Failed to initialize game:', result.reason);
    return;
  }

  let gameState = result.gameState;
  console.log('✅ Game initialized');
  console.log('Turn order:', result.turnOrder.map(p => `${p.name}(🎲${p.diceRoll})`).join(' → '));

  // Simulate turns until someone wins or 500 turns pass
  let turnCount = 0;
  const MAX_TURNS = 500;

  while (gameState.status === 'playing' && turnCount < MAX_TURNS) {
    const activePlayer = gameState.players[gameState.currentPlayerIndex];
    turnCount++;

    // Try to play the top pile card if possible
    const topPileCard = activePlayer.pile[0];
    let actionTaken = false;

    // Check for mandatory Ace first
    const aceInHand = activePlayer.hand.find(c => c.value === 1);
    const aceInPile = topPileCard?.value === 1;

    if (aceInHand || aceInPile) {
      const aceCard  = aceInHand || topPileCard;
      const aceSource = aceInHand ? 'hand' : 'pile';

      const aceResult = handlePlayerAction(gameState, activePlayer.id, {
        type:           'playCard',
        cardId:         aceCard.id,
        source:         aceSource,
        staircaseIndex: gameState.staircases.length,
      });

      if (aceResult.success) {
        gameState = aceResult.gameState;
        actionTaken = true;
        console.log(`Turn ${turnCount}: ${activePlayer.name} played Ace → new staircase`);

        if (aceResult.gameOver) {
          console.log(`\n🏆 ${aceResult.winner.name} wins after ${turnCount} turns!`);
          await persistGame(gameState, 'test-game-001');
          return;
        }
        continue;
      }
    }

    // Try to play a card on an existing staircase
    if (!actionTaken && gameState.staircases.length > 0) {
      for (const card of [...activePlayer.hand, topPileCard].filter(Boolean)) {
        for (let si = 0; si < gameState.staircases.length; si++) {
          const source = activePlayer.hand.includes(card) ? 'hand' : 'pile';
          const playResult = handlePlayerAction(gameState, activePlayer.id, {
            type:           'playCard',
            cardId:         card.id,
            source,
            staircaseIndex: si,
          });

          if (playResult.success) {
            gameState = playResult.gameState;
            actionTaken = true;

            if (playResult.gameOver) {
              console.log(`\n🏆 ${playResult.winner.name} wins after ${turnCount} turns!`);
              await persistGame(gameState, 'test-game-001');
              return;
            }
            break;
          }
        }
        if (actionTaken) break;
      }
    }

    // No playable card — discard from hand
    if (!actionTaken) {
      const cardToDiscard = activePlayer.hand[0];
      if (cardToDiscard) {
        const discardResult = handlePlayerAction(gameState, activePlayer.id, {
          type:          'discard',
          cardId:        cardToDiscard.id,
          rowIndex:      turnCount % 4, // Rotate through rows
          assignedValue: cardToDiscard.isWild ? 7 : null,
        });

        if (discardResult.success) {
          gameState = discardResult.gameState;
        }
      }
    }
  }

  if (turnCount >= MAX_TURNS) {
    console.log(`\n⏱️ Game ended after ${MAX_TURNS} turns without a winner.`);
    console.log('Player pile counts:');
    gameState.players.forEach(p => {
      console.log(`  ${p.name}: ${p.pile.length} cards remaining`);
    });
  }
}

async function persistGame(gameState, gameId) {
  try {
    const winner     = gameState.players.find(p => p.isWinner);
    const savedGame  = await saveGame(gameId, gameState.players.length, null, gameState.turnNumber);

    const participants = gameState.players.map((p, i) => ({
      userId:    null,
      diceRoll:  p.diceRoll,
      finalPile: p.pile.length,
      position:  p.isWinner ? 1 : i + 1,
    }));

    await saveGameParticipants(savedGame.id, participants);
    console.log('✅ Game saved to database successfully!');

    // Verify in DB
    console.log('\n📊 Saved game ID:', savedGame.id);
  } catch (err) {
    console.error('❌ Failed to save game:', err.message);
  }
}

simulateGame()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Simulation error:', err);
    process.exit(1);
  });