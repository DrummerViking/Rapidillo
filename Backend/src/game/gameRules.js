// =============================================
// gameRules.js — Game rules and validations
// =============================================

// =============================================
// FUNCTION 1: Check if a card can be played on a staircase
//
// Rules:
// - The staircase goes from A(1) to Q(12)
// - Suits don't matter, only the value
// - Wilds (K or Joker) can act as any value between 2 and 12
// - Two consecutive wilds are NOT allowed
//   Exception: if the second wild has an assignedValue (discarded wild), it IS allowed
// =============================================
function canPlayOnStaircase(card, staircase) {

    // The next expected value in the staircase
    const nextValue = staircase.length + 1; // Ex: if staircase has 3 cards, next is 4

    // Cannot play on a completed staircase (already has A through Q = 12 cards)
    if (staircase.length >= 12) return false;

    // --- Case 1: The card is a wild (K or Joker) ---
    if (card.isWild) {

        // Wilds cannot act as Ace (value 1)
        if (nextValue === 1) return false;

        // Wilds cannot act as values above 12
        if (nextValue > 12) return false;

        // Check if the previous card in the staircase was also a wild
        const previousCard = staircase[staircase.length - 1];
        const previousWasWild = previousCard && previousCard.isWild;

        if (previousWasWild) {
            // Two consecutive wilds are NOT allowed
            // EXCEPTION: the current card is a discarded wild with an assignedValue
            if (card.assignedValue === null || card.assignedValue === undefined) {
                return false; // ❌ Two consecutive wilds — not allowed
            }
            // ✅ The card is a discarded wild with an assigned value — allowed
        }

        return true; // ✅ Wild can be played
    }

    // --- Case 2: The card is a normal card ---

    // The card value must match exactly the next expected value in the staircase
    return card.value === nextValue;
}

// =============================================
// FUNCTION 2: Get the effective value of a card on a staircase
//
// - Normal cards: their face value
// - Wilds with assignedValue: the assigned value
// - Wilds without assignedValue: the next position in the staircase
// =============================================
function getEffectiveValue(card, staircase) {
    if (!card.isWild) return card.value;

    if (card.assignedValue !== null && card.assignedValue !== undefined) {
        return card.assignedValue;
    }

    // Wild without assignedValue acts as the next position
    return staircase.length + 1;
}

// =============================================
// FUNCTION 3: Check if a player has an Ace in their available cards
//
// An Ace MUST be played if the player has one.
// Available sources: hand, top of pile, top of each discard row
// =============================================
function findMandatoryAce(player) {
    // Check hand
    const aceInHand = player.hand.find(c => c.value === 1);
    if (aceInHand) return { card: aceInHand, source: 'hand' };

    // Check top of pile
    if (player.pile.length > 0 && player.pile[0].value === 1) {
        return { card: player.pile[0], source: 'pile' };
    }

    // Check top of each discard row
    for (let i = 0; i < player.discardRows.length; i++) {
        const row = player.discardRows[i];
        if (row.length > 0) {
            const topCard = row[row.length - 1]; // Top card (LIFO)
            if (topCard.value === 1) {
                return { card: topCard, source: 'discard', rowIndex: i };
            }
        }
    }

    return null; // No Ace found — no mandatory play
}

// =============================================
// FUNCTION 4: Check if a player can end their turn
//
// A player MUST discard one card to end their turn.
// They can always end their turn, UNLESS they have an Ace
// that hasn't been played yet.
// =============================================
function canEndTurn(player) {
    const mandatoryAce = findMandatoryAce(player);

    if (mandatoryAce) {
        return {
            allowed: false,
            reason: `You must play the Ace before ending your turn.`
        };
    }

    return { allowed: true };
}

// =============================================
// FUNCTION 5: Check if a staircase is complete
//
// A staircase is complete when it has 12 cards (A through Q)
// =============================================
function isStaircaseComplete(staircase) {
    return staircase.length === 12;
}

// =============================================
// FUNCTION 6: Validate a full play action
//
// Validates that a player's intended action is legal.
// action = {
//   type: 'playCard' | 'discard',
//   cardId: string,
//   source: 'hand' | 'pile' | 'discard',
//   staircaseIndex: number (only for playCard),
//   rowIndex: number (only for discard),
//   assignedValue: number | null (only for wilds being discarded)
// }
// =============================================
function validateAction(action, player, staircases) {

    // --- Action: Play a card on a staircase ---
    if (action.type === 'playCard') {

        // Find the card in the declared source
        let card = null;

        if (action.source === 'hand') {
            card = player.hand.find(c => c.id === action.cardId);
        } else if (action.source === 'pile') {
            card = player.pile.length > 0 ? player.pile[0] : null;
        } else if (action.source === 'discard') {
            const row = player.discardRows[action.rowIndex];
            card = row && row.length > 0 ? row[row.length - 1] : null;
        }

        if (!card) {
            return { valid: false, reason: 'Card not found in the declared source.' };
        }

        // Verify the card ID matches
        if (card.id !== action.cardId) {
            return { valid: false, reason: 'Card ID does not match the source.' };
        }

        // Verify the staircase exists
        const staircase = staircases[action.staircaseIndex];
        if (!staircase) {
            return { valid: false, reason: 'Staircase not found.' };
        }

        // Special case: playing an Ace starts a NEW staircase, not an existing one
        if (card.value === 1 && !card.isWild) {
            return { valid: true }; // Ace always valid — starts a new staircase
        }

        // Validate the card can be placed on the chosen staircase
        if (!canPlayOnStaircase(card, staircase)) {
            return {
                valid: false,
                reason: `Card cannot be played on this staircase. Expected value: ${staircase.length + 1}.`
            };
        }

        return { valid: true };
    }

    // --- Action: Discard a card ---
    if (action.type === 'discard') {

        // Verify the player is allowed to end their turn
        const turnCheck = canEndTurn(player);
        if (!turnCheck.allowed) {
            return { valid: false, reason: turnCheck.reason };
        }

        // Verify the row index is valid (0 to 3)
        if (action.rowIndex < 0 || action.rowIndex > 3) {
            return { valid: false, reason: 'Invalid discard row. Must be between 0 and 3.' };
        }

        // Verify the card exists in hand (discarding from pile is NOT allowed)
        const card = player.hand.find(c => c.id === action.cardId);
        if (!card) {
            return { valid: false, reason: 'Card not found in hand. You can only discard from your hand.' };
        }

        // Aces can NEVER be discarded — they must always be played on the table
        if (card.value === 1 && !card.isWild) {
            return { valid: false, reason: 'Aces cannot be discarded. You must play it on the table to start a new staircase.' };
        }

        // If discarding a wild, assignedValue must be between 2 and 12
        if (card.isWild) {
            if (action.assignedValue === null || action.assignedValue === undefined) {
                return { valid: false, reason: 'You must assign a value (2–12) when discarding a wild card.' };
            }
            if (action.assignedValue < 2 || action.assignedValue > 12) {
                return { valid: false, reason: 'Assigned value for a wild must be between 2 and 12.' };
            }
        }

        return { valid: true };
    }

    return { valid: false, reason: 'Unknown action type.' };
}

// --- EXPORT all functions ---
module.exports = {
    canPlayOnStaircase,
    getEffectiveValue,
    findMandatoryAce,
    canEndTurn,
    isStaircaseComplete,
    validateAction
};