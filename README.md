# 🃏 Rapidillo

A multiplayer card game built with React Native (Expo) and Node.js.
Play on Web, Android, and iOS from a single codebase.

---

## 📖 Table of Contents

- [Game Rules](#game-rules)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Backend — File Reference](#backend--file-reference)
- [Frontend — File Reference](#frontend--file-reference)
- [Getting Started](#getting-started)
- [Contributing](#contributing)

---

## 🎮 Game Rules

### Objective
Be the first player to empty your **pile** of 21 cards.

### Setup
- 2 to 6 players — one deck of 54 cards per player.
- Each player starts with:
  - A **pile** of 21 cards (only the top card is visible)
  - A **hand** of 5 cards (visible only to the owner)
- Remaining cards form the **shared deck** on the table.
- Turn order is determined by a dice roll — highest number goes first.

### Card Values
| Card | Value | Role |
|------|-------|------|
| A (Ace) | 1 | Starts a new staircase — **mandatory to play** |
| 2–10 | Face value | Normal cards |
| J (Jack) | 11 | Normal card |
| Q (Queen) | 12 | Completes a staircase |
| K (King) | Wild | Acts as any value from 2–12 |
| Joker | Wild | Acts as any value from 2–12 |

### Staircases
- Shared between all players on the table.
- Each staircase starts with an Ace and goes up to Q (12 cards total).
- Suits don't matter — only the value.
- When a staircase is completed (A→Q), those 12 cards are shuffled back into the shared deck.
- Multiple staircases can coexist on the table.

### Wild Card Rules
- Wilds (K and Joker) can act as any value from **2 to 12**.
- Wilds **cannot** act as an Ace.
- **Two consecutive wilds are not allowed** on the same staircase.
  - Exception: a wild that was previously discarded with an assigned value CAN follow another wild.

### Pile Rules
- Only the top card of the pile is visible to all players.
- If the top card is a wild, the owner can also see the next card — and so on until a non-wild card is found.
- Other players always see only the top card of each pile.

### Discard Rows
- Each player has **4 personal discard rows** (LIFO — last in, first out).
- Visible to all players.
- Cards can be played in any order — no sequence required.
- Discarding a wild requires assigning it a value (2–12).
- The top card of each discard row can be played onto a staircase.
- **Aces can never be discarded.**

### Turn Flow
1. **Draw** — Refill hand to 5 cards from the shared deck.
2. **Play** — Play cards from your hand, pile top, or discard row tops onto staircases.
3. **Discard** — Discard one card from your hand to end your turn.

### Winning
The first player to empty their pile wins. 🏆

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React Native + Expo | iOS, Android, and Web from one codebase |
| State management | Zustand | Global app state |
| Animations | React Native Reanimated | Smooth card animations |
| Backend | Node.js + Express | Game server |
| Real-time | Socket.IO | Player synchronization |
| Database | PostgreSQL | User accounts and game history |
| Cache | Redis | Live game sessions |

---

## 🏗️ Project Architecture
```
Rapidillo/
├── Backend/               ← Game server (Node.js)
│   └── src/
│       ├── game/          ← Core game logic
│       ├── sockets/       ← Real-time event handlers
│       ├── db/            ← Database models and queries
│       └── server.js      ← Entry point
│
├── frontend/              ← Client app (React Native + Expo)
│   └── src/
│       ├── screens/       ← App screens
│       ├── components/    ← Reusable UI components
│       ├── store/         ← Global state (Zustand)
│       ├── sockets/       ← Socket.IO client
│       ├── locales/       ← Translations (i18n)
│       └── utils/         ← Helpers and themes
│
├── README.md
└── CONTRIBUTING.md
```

### Communication Flow
```
[Player taps "Play card"]
        ↓
   GameScreen.jsx          ← User interaction
        ↓
   socketClient.js         ← Emits event to server
        ↓  (WebSocket)
   gameHandler.js          ← Server receives event
        ↓
   gameRules.js            ← Validates the action
        ↓
   gameState.js            ← Updates game state
        ↓
   (broadcasts to all)     ← Sends updated views to all players
        ↓
   GameScreen.jsx          ← All players see the updated table
```

---

## 🖥️ Backend — File Reference

### `src/game/deck.js`
Manages the card deck.

| Function | Description |
|----------|-------------|
| `createDeck()` | Creates a standard 54-card deck |
| `shuffleDeck(deck)` | Shuffles using Fisher-Yates algorithm |
| `createGameDecks(n)` | Creates and merges n decks (one per player) |
| `drawCards(deck, n)` | Draws n cards from the top of the deck |

---

### `src/game/player.js`
Manages individual player state.

| Function | Description |
|----------|-------------|
| `createPlayer(id, name, deck)` | Creates a player with pile (21) and hand (5) |
| `refillHand(player, deck)` | Draws cards until hand has 5 |
| `getTopOfPile(player)` | Returns the top card of the pile |
| `getVisiblePileCards(player)` | Returns visible pile cards (owner only — reveals through wilds) |
| `playFromPile(player)` | Removes and returns the top pile card |
| `playFromHand(player, cardId)` | Removes and returns a card from hand |
| `playFromDiscard(player, rowIndex)` | Removes and returns the top card of a discard row |
| `discardCard(player, cardId, rowIndex, assignedValue?)` | Discards a hand card to a row |
| `checkWinner(player)` | Returns true if the pile is empty |

---

### `src/game/gameRules.js`
Validates all game actions.

| Function | Description |
|----------|-------------|
| `canPlayOnStaircase(card, staircase)` | Checks if a card can be added to a staircase |
| `getEffectiveValue(card, staircase)` | Returns the effective numeric value of a card |
| `findMandatoryAce(player)` | Checks if the player has an Ace that must be played |
| `canEndTurn(player)` | Checks if the player is allowed to discard and end their turn |
| `isStaircaseComplete(staircase)` | Returns true if the staircase has 12 cards |
| `validateAction(action, player, staircases)` | Full validation of any player action |

---

### `src/game/gameState.js`
Manages the complete game state.

| Function | Description |
|----------|-------------|
| `createGame(gameId, playersInfo)` | Initializes a new game (deals cards, rolls dice) |
| `getActivePlayer(gameState)` | Returns the player whose turn it is |
| `processAction(gameState, playerId, action)` | Main entry point for all player actions |
| `advanceTurn(gameState)` | Passes the turn to the next player |
| `getPlayerView(gameState, playerId)` | Returns a sanitized state view for a specific player |

---

### `src/game/turnManager.js`
Orchestrates the turn flow.

| Function | Description |
|----------|-------------|
| `initializeGame(gameId, playersInfo)` | Full game setup including dice tie-breaking |
| `resolveDiceTies(gameState)` | Re-rolls for tied players until all rolls are unique |
| `handlePlayerAction(gameState, playerId, action)` | Processes an action and returns updated views |
| `checkAndReshuffleDeck(gameState)` | Handles the edge case of an empty shared deck |
| `getTurnSummary(gameState)` | Returns a human-readable summary of the current turn |
| `canStartGame(playersInfo)` | Validates pre-conditions before starting |

---

### `src/sockets/roomHandler.js`
Socket events for room management.

| Event (in) | Description |
|------------|-------------|
| `createRoom` | Host creates a new waiting room |
| `joinRoom` | Player joins an existing room |
| `startGame` | Host starts the game (validates min 2 players) |

| Event (out) | Description |
|-------------|-------------|
| `roomCreated` | Confirms room creation to host |
| `playerJoined` | Notifies all players when someone joins |
| `gameStarted` | Sends initial game view to each player |

---

### `src/sockets/gameHandler.js`
Socket events for in-game actions.

| Event (in) | Description |
|------------|-------------|
| `playerAction` | Player plays or discards a card |
| `requestTurnSummary` | Player requests current turn state |

| Event (out) | Description |
|-------------|-------------|
| `gameUpdated` | Sends updated views to all players after an action |
| `actionRejected` | Notifies a player their action was invalid |
| `gameOver` | Broadcasts the winner to all players |
| `turnSummary` | Returns current turn summary to requesting player |

---

## 📱 Frontend — File Reference

### `src/screens/`

| Screen | Description |
|--------|-------------|
| `HomeScreen.jsx` | Main menu — enter name, create or join a room |
| `LobbyScreen.jsx` | Waiting room — shows connected players, host starts game |
| `GameScreen.jsx` | Main game screen — table, hand, pile, staircases |
| `ResultScreen.jsx` | End screen — shows winner and final stats |

### `src/store/`

| File | Description |
|------|-------------|
| `settingsStore.js` | Global settings — theme (dark/light) and language |

### `src/sockets/`

| File | Description |
|------|-------------|
| `socketClient.js` | Socket.IO client — connect, emit, and receive events |

### `src/locales/`

| File | Description |
|------|-------------|
| `en.js` | English translations (default) |
| `es.js` | Spanish translations |
| `index.js` | Language engine — `t(key, params)` translation function |

### `src/utils/`

| File | Description |
|------|-------------|
| `themes.js` | Dark and light theme color definitions |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Expo Go app (iOS or Android)

### Backend setup
```bash
cd Backend
npm install
node src/server.js
```

### Frontend setup
```bash
cd frontend
npm install
npx expo start
```

> ⚠️ Update `src/sockets/socketClient.js` with your local IP address before running.

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute translations, bug fixes, and new features.