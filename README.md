# 🃏 Rapidillo

A multiplayer card game built with React Native (Expo) and Node.js.
Play on Web, Android, and iOS from a single codebase.

---

## 📖 Table of Contents

- [Game Rules](#-game-rules)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Backend — File Reference](#-backend--file-reference)
- [Frontend — File Reference](#-frontend--file-reference)
- [Getting Started](#-getting-started)
- [Internationalization](#-internationalization)
- [Code Conventions](#-code-conventions)
- [Contributing](#-contributing)

---

## 🎮 Game Rules

### Objective
Be the first player to empty your **pile** of 21 cards.

### Setup
- 2 to 6 players — one deck of 54 cards per player.
- Each player starts with:
  - A **pile** of 21 cards (only the top card is visible to all players)
  - A **hand** of 5 cards (visible only to the owner)
- Remaining cards form the **shared deck** on the table.
- Turn order is determined by a dice roll — highest number goes first. Ties are re-rolled automatically.

### Card Values
| Card | Value | Role |
|------|-------|------|
| A (Ace) | 1 | Starts a new staircase — **mandatory to play immediately** |
| 2–10 | Face value | Normal cards |
| J (Jack) | 11 | Normal card |
| Q (Queen) | 12 | Completes a staircase |
| K (King) | Wild | Acts as any value from 2–12 |
| Joker | Wild | Acts as any value from 2–12 |

### Staircases
- Shared between all players on the table.
- Each staircase starts with an Ace and goes up to Q (12 cards total).
- Suits don't matter — only the value counts.
- When a staircase is completed (A→Q), those 12 cards are shuffled back into the shared deck.
- Multiple staircases can coexist on the table simultaneously.

### Wild Card Rules
- Wilds (K and Joker) can act as any value from **2 to 12**.
- Wilds **cannot** act as an Ace.
- **Two consecutive wilds are not allowed** on the same staircase.
  - Exception: a wild that was previously discarded with an assigned value CAN follow another wild.

### Pile Rules
- Only the top card of the pile is visible to all players.
- If the top card is a wild, the **owner** can also see the next card — and so on until a non-wild card is found.
- Other players always see only the top card of each pile.
- Players **cannot** discard cards from their pile to discard rows.

### Discard Rows
- Each player has **4 personal discard rows** (LIFO — last in, first out).
- Fully visible to all players at all times.
- Cards can be placed in any order — no sequence required.
- Discarding a wild card requires assigning it a value (2–12).
- The top card of each discard row can be played onto a staircase.
- **Aces can never be discarded** — they must always be played immediately.

### Turn Flow
1. **Draw** — Refill hand up to 5 cards from the shared deck.
2. **Play** — Play cards from your hand, pile top, or discard row tops onto staircases.
3. **Discard** — Discard one card from your hand to end your turn (mandatory).

> A player may choose to discard immediately without playing, even if they have playable cards — except when holding an Ace, which must always be played first.

### Winning
The first player to empty their pile wins. 🏆

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React Native + Expo | iOS, Android, and Web from one codebase |
| State management | Zustand | Global app state (auth, settings) |
| Animations | React Native Reanimated | Smooth card animations |
| Navigation | React Navigation | Screen routing |
| Backend | Node.js + Express | Game server and REST API |
| Real-time | Socket.IO | Player synchronization |
| Database | PostgreSQL | User accounts and game history |
| Auth | JWT + bcryptjs | Secure authentication |

---

## 🏗️ Project Architecture

```
Rapidillo/
├── Backend/                   ← Game server (Node.js)
│   └── src/
│       ├── game/              ← Core game logic (no dependencies)
│       │   ├── deck.js        ← Deck creation, shuffling, drawing
│       │   ├── player.js      ← Player state: hand, pile, discard rows
│       │   ├── gameRules.js   ← All rule validations
│       │   ├── gameState.js   ← Full game state manager
│       │   └── turnManager.js ← Turn orchestration
│       ├── sockets/           ← Real-time event handlers
│       │   ├── roomHandler.js ← Create/join rooms
│       │   └── gameHandler.js ← In-game events + DB persistence
│       ├── db/                ← Database layer
│       │   ├── db.js          ← PostgreSQL connection pool
│       │   ├── queries.js     ← All SQL queries
│       │   └── auth.js        ← Registration, login, JWT
│       └── server.js          ← Entry point: Express + Socket.IO + REST routes
│
├── frontend/                  ← Client app (React Native + Expo)
│   └── src/
│       ├── screens/           ← App screens
│       │   ├── AuthScreen.jsx    ← Login and registration
│       │   ├── HomeScreen.jsx    ← Main menu
│       │   ├── LobbyScreen.jsx   ← Waiting room
│       │   ├── GameScreen.jsx    ← Main game screen
│       │   ├── ResultScreen.jsx  ← Game over / winner
│       │   ├── ProfileScreen.jsx ← User stats and history
│       │   └── HelpScreen.jsx    ← Game rules
│       ├── components/        ← Reusable UI components
│       │   ├── Card.jsx          ← Individual playing card
│       │   ├── Staircase.jsx     ← Staircase on the table
│       │   ├── PlayerPile.jsx    ← Player pile (stack)
│       │   ├── DiscardRow.jsx    ← Single discard row
│       │   ├── PlayerHand.jsx    ← Player's hand
│       │   └── LanguagePicker.jsx ← Language dropdown selector
│       ├── store/             ← Global state (Zustand)
│       │   ├── authStore.js      ← Auth state: user, token, logout
│       │   └── settingsStore.js  ← Theme and language settings
│       ├── sockets/           ← Socket.IO client
│       │   └── socketClient.js   ← Connect, emit, receive
│       ├── locales/           ← Translations (i18n)
│       │   ├── en.js             ← English (default)
│       │   ├── es.js             ← Spanish
│       │   ├── pt_BR.js          ← Portuguese (Brazil)
│       │   ├── it.js             ← Italian
│       │   ├── fr.js             ← French
│       │   ├── de.js             ← German
│       │   └── index.js          ← Language engine: t(key, params)
│       └── utils/             ← Helpers
│           ├── themes.js         ← Dark and light theme definitions
│           └── apiClient.js      ← HTTP requests to the backend
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
   (broadcasts to all)     ← Sends sanitized views to all players
        ↓
   GameScreen.jsx          ← All players see the updated table

[Game ends]
        ↓
   gameHandler.js          ← Detects winner
        ↓
   queries.js              ← Saves game + participants to PostgreSQL
        ↓
   ResultScreen.jsx        ← Shows winner + final standings
```

---

## 🖥️ Backend — File Reference

### `src/game/deck.js`
Manages the card deck.

| Function | Description |
|----------|-------------|
| `createDeck()` | Creates a standard 54-card deck (52 + 2 Jokers) |
| `shuffleDeck(deck)` | Shuffles using Fisher-Yates algorithm |
| `createGameDecks(n)` | Creates and merges n decks (one per player) |
| `drawCards(deck, n)` | Draws n cards from the top of the deck |

---

### `src/game/player.js`
Manages individual player state.

| Function | Description |
|----------|-------------|
| `createPlayer(id, name, deck)` | Creates a player with pile (21 cards) and hand (5 cards) |
| `refillHand(player, deck)` | Draws cards until hand has 5 |
| `getTopOfPile(player)` | Returns the top card of the pile |
| `getVisiblePileCards(player)` | Returns visible pile cards for the owner (reveals through wilds) |
| `playFromPile(player)` | Removes and returns the top pile card |
| `playFromHand(player, cardId)` | Removes and returns a card from hand |
| `playFromDiscard(player, rowIndex)` | Removes and returns the top card of a discard row |
| `discardCard(player, cardId, rowIndex, assignedValue?)` | Discards a hand card to a row (Aces not allowed) |
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
| `isStaircaseComplete(staircase)` | Returns true if the staircase has 12 cards (A→Q) |
| `validateAction(action, player, staircases)` | Full validation of any player action |

---

### `src/game/gameState.js`
Manages the complete game state.

| Function | Description |
|----------|-------------|
| `createGame(gameId, playersInfo)` | Initializes a new game (deals cards, rolls dice) |
| `getActivePlayer(gameState)` | Returns the player whose turn it is |
| `processAction(gameState, playerId, action)` | Main entry point for all player actions |
| `advanceTurn(gameState)` | Passes the turn to the next player and refills their hand |
| `handleCompletedStaircase(gameState, index)` | Returns completed staircase cards to the shared deck |
| `getPlayerView(gameState, playerId)` | Returns a sanitized state view for a specific player |

#### Information visibility per player
| Data | Own player | Other players |
|------|-----------|--------------|
| Hand | ✅ Full | ❌ Hidden (count only) |
| Pile | ✅ Visible cards (through wilds) | 👁️ Top card only |
| Discard rows | ✅ Full | ✅ Full |
| Staircases | ✅ Full | ✅ Full |
| Shared deck | Count only | Count only |

---

### `src/game/turnManager.js`
Orchestrates the turn flow.

| Function | Description |
|----------|-------------|
| `initializeGame(gameId, playersInfo)` | Full game setup including dice tie-breaking |
| `resolveDiceTies(gameState)` | Re-rolls for tied players until all rolls are unique |
| `handlePlayerAction(gameState, playerId, action)` | Processes an action and returns updated views for all players |
| `checkAndReshuffleDeck(gameState)` | Handles the edge case of an empty shared deck |
| `getTurnSummary(gameState)` | Returns a human-readable summary of the current turn |
| `canStartGame(playersInfo)` | Validates pre-conditions before starting (min 2, max 6 players) |

---

### `src/db/db.js`
PostgreSQL connection pool.

| Function | Description |
|----------|-------------|
| `query(text, params)` | Executes a parameterized SQL query |

---

### `src/db/queries.js`
All SQL queries for the application.

| Function | Description |
|----------|-------------|
| `createUser(username, email, password)` | Creates a new user account (hashes password) |
| `findUserByUsername(username)` | Finds a user by username |
| `findUserById(id)` | Finds a user by ID |
| `updateLastLogin(userId)` | Updates the last login timestamp |
| `verifyPassword(plain, hash)` | Compares a plain password against its hash |
| `saveGame(gameId, playerCount, winnerId, turnCount)` | Saves a completed game record |
| `saveGameParticipants(gameDbId, participants)` | Saves each player's result (supports guest players with null userId) |
| `getUserGameHistory(userId, limit)` | Returns a user's last N games |
| `getUserStats(userId)` | Returns aggregated stats (wins, win rate, avg turns, best game) |
| `getLeaderboard()` | Returns top 10 players by win rate (min 3 games played) |

---

### `src/db/auth.js`
Authentication logic.

| Function | Description |
|----------|-------------|
| `register(username, email, password)` | Creates a user account with password strength validation |
| `login(username, password)` | Authenticates a user and returns a JWT token |
| `verifyToken(token)` | Validates a JWT token and returns the decoded payload |
| `validatePasswordStrength(password)` | Validates password complexity rules |

#### Password requirements
- Minimum 8 characters
- At least one lowercase letter
- At least one uppercase letter
- At least one number
- At least one special character (`!@#$%^&*...`)

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
| `gameStarted` | Sends initial sanitized game view to each player individually |

---

### `src/sockets/gameHandler.js`
Socket events for in-game actions. Also handles DB persistence on game over.

| Event (in) | Description |
|------------|-------------|
| `playerAction` | Player plays or discards a card |
| `requestTurnSummary` | Player requests current turn state |

| Event (out) | Description |
|-------------|-------------|
| `gameUpdated` | Sends updated sanitized views to all players after an action |
| `actionRejected` | Notifies a player their action was invalid |
| `gameOver` | Broadcasts winner + final standings to all players |
| `turnSummary` | Returns current turn summary to requesting player |

### REST API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/register` | No | Create a new user account |
| POST | `/auth/login` | No | Login and receive a JWT token |
| GET | `/profile/stats` | JWT | Get the authenticated user's stats |
| GET | `/profile/history` | JWT | Get the authenticated user's game history |
| GET | `/leaderboard` | No | Get the top 10 players globally |

---

### Database Schema

```sql
users
  id            SERIAL PRIMARY KEY
  username      VARCHAR(30) UNIQUE NOT NULL
  email         VARCHAR(100) UNIQUE NOT NULL
  password_hash VARCHAR(255) NOT NULL
  created_at    TIMESTAMP
  last_login    TIMESTAMP

games
  id            SERIAL PRIMARY KEY
  game_id       VARCHAR(50) UNIQUE NOT NULL
  player_count  INTEGER NOT NULL
  winner_id     INTEGER REFERENCES users(id)
  turn_count    INTEGER NOT NULL
  started_at    TIMESTAMP
  finished_at   TIMESTAMP

game_participants
  id            SERIAL PRIMARY KEY
  game_id       INTEGER REFERENCES games(id)
  user_id       INTEGER REFERENCES users(id)  ← NULL for guest players
  dice_roll     INTEGER
  final_pile    INTEGER
  position      INTEGER  ← 1 = winner
  joined_at     TIMESTAMP
```

---

## 📱 Frontend — File Reference

### Screens

| Screen | Description |
|--------|-------------|
| `AuthScreen.jsx` | Login and registration with password strength indicator |
| `HomeScreen.jsx` | Main menu — name input, create/join room, profile access |
| `LobbyScreen.jsx` | Waiting room — shows connected players, host starts game |
| `GameScreen.jsx` | Main game — table, staircases, hand, pile, discard rows, wild modal |
| `ResultScreen.jsx` | End screen — winner, final standings, turn count |
| `ProfileScreen.jsx` | User profile — stats tab and game history tab |
| `HelpScreen.jsx` | Game rules reference (scrollable, multilingual) |

### Components

| Component | Description |
|-----------|-------------|
| `Card.jsx` | Individual card (normal, wild/K, Joker, face-down). Supports selected state and assigned value badge |
| `Staircase.jsx` | A staircase on the shared table with progress bar and next-value indicator |
| `PlayerPile.jsx` | Player's pile with stacked shadow effect and visible-cards support |
| `DiscardRow.jsx` | Single discard row (LIFO) with play and discard interactions |
| `PlayerHand.jsx` | Scrollable hand of cards fixed at the bottom of the screen |
| `LanguagePicker.jsx` | Dropdown language selector with flag, label, and active checkmark |

### Stores (Zustand)

| Store | State | Actions |
|-------|-------|---------|
| `authStore.js` | `user`, `token` | `setAuth(user, token)`, `logout()`, `isLoggedIn()` |
| `settingsStore.js` | `theme`, `isDarkMode`, `language` | `toggleTheme()`, `setLanguage(code)`, `t(key, params)` |

### Utils

| File | Description |
|------|-------------|
| `themes.js` | `darkTheme` and `lightTheme` color objects used across all screens |
| `apiClient.js` | `api.get(endpoint, token)` and `api.post(endpoint, body, token)` — adapts URL for web vs mobile |
| `socketClient.js` | `connectSocket()`, `getSocket()`, `disconnectSocket()` — adapts URL for web vs mobile |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- PostgreSQL 16+
- Expo Go app (for mobile testing)

### 1. Clone the repository
```bash
git clone https://github.com/DrummerViking/Rapidillo.git
cd Rapidillo
```

### 2. Backend setup
```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rapidillo
DB_USER=rapidillo_user
DB_PASSWORD=your_password_here
JWT_SECRET=your_long_secret_key_here
```

Create the PostgreSQL database:
```bash
psql -U postgres
```
```sql
CREATE DATABASE rapidillo;
CREATE USER rapidillo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rapidillo TO rapidillo_user;
\c rapidillo
GRANT ALL ON SCHEMA public TO rapidillo_user;
```

Run the SQL schema (users, games, game_participants tables) — see `src/db/queries.js` for the full schema.

Start the server:
```bash
node src/server.js
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Update your local IP in two files:
- `src/sockets/socketClient.js`
- `src/utils/apiClient.js`

```javascript
const SERVER_URL = Platform.OS === 'web'
  ? 'http://localhost:3000'
  : 'http://YOUR_LOCAL_IP:3000'; // find with: ipconfig (Windows) or ifconfig (Mac/Linux)
```

Start the app:
```bash
npx expo start
```

- Press `w` to open in browser
- Scan the QR code with Expo Go for mobile

---

## 🌍 Internationalization

The app supports multiple languages out of the box. The language engine is in `frontend/src/locales/index.js`.

### Available languages
| Code | Language | Flag |
|------|----------|------|
| `en` | English | 🇬🇧 |
| `es` | Spanish | 🇪🇸 |
| `pt_BR` | Portuguese (Brazil) | 🇧🇷 |
| `it` | Italian | 🇮🇹 |
| `fr` | French | 🇫🇷 |
| `de` | German | 🇩🇪 |

### Adding a new language
1. Copy `frontend/src/locales/en.js` and rename it (e.g. `ja.js` for Japanese)
2. Translate all **values** — never touch the keys
3. Keep `{placeholders}` exactly as they are
4. Register it in `frontend/src/locales/index.js`:

```javascript
import ja from './ja';

export const LANGUAGES = {
  // ...existing languages...
  ja: { label: '日本語', flag: '🇯🇵', translations: ja },
};
```

The flag appears automatically in the language picker. No other changes needed.

---

## 📐 Code Conventions

- All code, comments, and commit messages must be in **English**
- Card suits: `'hearts'`, `'diamonds'`, `'clubs'`, `'spades'`
- Card values: `1` (Ace) through `13` (King), plus Jokers (`isJoker: true`)
- Wild cards: King (`value === 13`) and Jokers (`isJoker === true`) — both have `isWild: true`
- Use `Platform.OS === 'web'` checks for `Alert.alert` (use `window.confirm` / `window.alert` on web)
- Theme colors always come from `useSettingsStore().theme` — never use hardcoded colors in screens
- All text visible to users must go through `t('key')` — never hardcode UI strings

### Platform notes
- `Alert.alert` with buttons does not work on Web — use `window.confirm()` instead
- `Platform.OS` returns `'web'`, `'android'`, or `'ios'`
- Socket and API URLs automatically adapt based on platform (localhost for web, local IP for mobile)

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to contribute translations, bug fixes, and new features.