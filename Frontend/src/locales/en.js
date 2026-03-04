// =============================================
// en.js — English (default language)
// =============================================

export default {
  // --- General ---
  appName: 'Rapidillo',
  appSubtitle: 'The card game',

  // --- HomeScreen ---
  home: {
    yourName: 'Your name',
    namePlaceholder: 'Enter your name...',
    whatToDo: 'What do you want to do?',
    createRoom: 'Create a room',
    joinRoom: 'Join a room',
    roomCode: 'Room code',
    roomCodeHint: 'Enter room code...',
    createButton: 'Create room →',
    joinButton: 'Join room →',
    errorNoName: 'Please enter your name before continuing.',
    errorNoCode: 'Please enter a room code to join.',
    viewProfile: 'View my profile & stats',
  },

  // --- HelpScreen ---
  help: {
    title: '📖 How to play',
    close: 'Close',
    objective: '🎯 Objective',
    objectiveText: 'Be the first player to empty your pile of 21 cards.',
    setup: '🃏 Setup',
    setupText: 'Each player gets 21 cards in their pile and 5 in their hand. The rest goes to the shared deck. Highest dice roll goes first.',
    staircases: '🪜 Staircases',
    staircasesText: 'Build shared staircases from A to Q (1–12). Suits don\'t matter. A completed staircase returns to the shared deck.',
    wilds: '🃏 Wild Cards',
    wildsText: 'K and Jokers act as any value from 2 to 12. Two consecutive wilds are not allowed (except a pre-assigned discarded wild).',
    turn: '🔄 Your Turn',
    turnText: '1. Draw cards until you have 5.\n2. Play cards from your hand, pile top, or discard rows.\n3. Discard one card to end your turn.',
    pile: '📦 Your Pile',
    pileText: 'Only the top card is visible. If it\'s a wild, you can also see the next card (and so on). You cannot discard pile cards.',
    discardRows: '🗂️ Discard Rows',
    discardRowsText: 'You have 4 personal discard rows (last in, first out). Their top cards can be played on staircases. Aces can never be discarded.',
    aces: '🅐 Aces',
    acesText: 'Aces must always be played immediately — they start a new staircase. You cannot discard an Ace.',
  },

  // --- LobbyScreen ---
  lobby: {
    title: 'Room',
    leave: '← Leave',
    leaveTitle: 'Leave room',
    leaveMessage: 'Are you sure you want to leave?',
    leaveCancel: 'Cancel',
    leaveConfirm: 'Leave',
    roomCodeLabel: 'Room code',
    roomCodeHint: 'Share this code with your friends',
    players: 'Players',
    you: '(you)',
    ready: '✅ Ready',
    connecting: 'Connecting to server...',
    roomCreated: 'Room created! Waiting for players...',
    waitingForHost: 'Connected! Waiting for host to start...',
    playerJoined: 'joined the room!',
    waitingPlayers: 'Waiting for players...',
    startGame: 'Start game with {count} players →',
    waitingHost: 'Waiting for host to start the game...',
    errorNotEnough: 'You need at least 2 players to start.',
    errorTitle: 'Error',
  },

  // --- GameScreen ---
  game: {
    yourHand: 'Your hand',
    yourPile: 'Your pile',
    discard: 'Discard',
    staircases: 'Staircases',
    yourTurn: "It's your turn!",
    waitingTurn: "Waiting for your turn...",
    playCard: 'Play card',
    discardCard: 'Discard card',
    mustPlayAce: '⚠️ You must play your Ace first!',
    deckEmpty: '⚠️ The deck is empty!',
    assignWild: 'Assign a value to this wild card (2–12)',
    assignConfirm: 'Confirm',
    assignCancel: 'Cancel',
  },

  // --- ResultScreen ---
  result: {
    winner: '🏆 Winner!',
    wins: 'wins the game!',
    playAgain: 'Play again',
    backHome: 'Back to home',
    turnCount: 'Game lasted {count} turns',
  },

  // --- AuthScreen ---
  auth: {
    loginTitle: 'Welcome back',
    registerTitle: 'Create account',
    username: 'Username',
    usernamePlaceholder: 'Enter your username...',
    email: 'Email',
    emailPlaceholder: 'Enter your email...',
    password: 'Password',
    passwordPlaceholder: 'Enter your password...',
    loginButton: 'Login →',
    registerButton: 'Create account →',
    switchToRegister: "Don't have an account? Register",
    switchToLogin: 'Already have an account? Login',
    loggingIn: 'Logging in...',
    registering: 'Creating account...',
    logoutButton: 'Logout',
    continueAsGuest: 'Continue as guest',
    errorTitle: 'Error',
    welcomeBack: 'Welcome back,',
  },

  // --- ProfileScreen ---
  profile: {
    title: 'My Profile',
    stats: 'Statistics',
    history: 'Game History',
    gamesPlayed: 'Games played',
    gamesWon: 'Games won',
    winRate: 'Win rate',
    avgTurns: 'Avg. turns per game',
    bestGame: 'Best game',
    turns: 'turns',
    noHistory: 'No games played yet.',
    position: 'Position',
    players: 'Players',
    date: 'Date',
    notLoggedIn: 'You must be logged in to view your profile.',
    loading: 'Loading profile...',
    winner: '🏆 Winner',
    guest: 'Guest player',
  },
};