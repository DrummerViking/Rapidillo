// =============================================
// es.js — Spanish
// =============================================

export default {
  // --- General ---
  appName: 'Rapidillo',
  appSubtitle: 'El juego de cartas',

  // --- HomeScreen ---
  home: {
    yourName: 'Tu nombre',
    namePlaceholder: 'Ingresa tu nombre...',
    whatToDo: '¿Qué quieres hacer?',
    createRoom: 'Crear una sala',
    joinRoom: 'Unirse a una sala',
    roomCode: 'Código de sala',
    roomCodeHint: 'Ingresa el código de sala...',
    createButton: 'Crear sala →',
    joinButton: 'Unirse →',
    errorNoName: 'Por favor ingresa tu nombre antes de continuar.',
    errorNoCode: 'Por favor ingresa el código de sala.',
  },

  // --- HelpScreen ---
  help: {
    title: '📖 Cómo jugar',
    close: 'Cerrar',
    objective: '🎯 Objetivo',
    objectiveText: 'Sé el primero en vaciar tu pozo de 21 cartas.',
    setup: '🃏 Configuración',
    setupText: 'Cada jugador recibe 21 cartas en su pozo y 5 en su mano. El resto va al mazo compartido. El dado más alto comienza.',
    staircases: '🪜 Escaleras',
    staircasesText: 'Se construyen escaleras compartidas de A hasta Q (1–12). La figura no importa. Una escalera completa vuelve al mazo.',
    wilds: '🃏 Comodines',
    wildsText: 'El K y los Jokers actúan como cualquier valor del 2 al 12. No se pueden jugar 2 comodines seguidos (excepto un comodín descartado con valor asignado).',
    turn: '🔄 Tu turno',
    turnText: '1. Robá cartas hasta tener 5.\n2. Jugá cartas de tu mano, tope del pozo o filas de descarte.\n3. Descartá una carta para terminar tu turno.',
    pile: '📦 Tu pozo',
    pileText: 'Solo el tope es visible. Si es un comodín, también podés ver la siguiente carta (y así). No podés descartar cartas del pozo.',
    discardRows: '🗂️ Filas de descarte',
    discardRowsText: 'Tenés 4 filas de descarte personales (última en entrar, primera en salir). Sus cartas tope se pueden jugar en escaleras. Los Ases nunca se pueden descartar.',
    aces: '🅐 Ases',
    acesText: 'Los Ases siempre deben jugarse de inmediato — inician una escalera nueva. No podés descartar un As.',
  },

  // --- LobbyScreen ---
  lobby: {
    title: 'Sala',
    leave: '← Salir',
    leaveTitle: 'Abandonar sala',
    leaveMessage: '¿Está seguro que quiere salir?',
    leaveCancel: 'Cancelar',
    leaveConfirm: 'Salir',
    roomCodeLabel: 'Código de sala',
    roomCodeHint: 'Comparte este código con tus amigos',
    players: 'Jugadores',
    you: '(tú)',
    ready: '✅ Listo',
    connecting: 'Conectando al servidor...',
    roomCreated: '¡Sala creada! Esperando jugadores...',
    waitingForHost: '¡Conectado! Esperando que el host inicie...',
    playerJoined: 'se unió a la sala!',
    waitingPlayers: 'Esperando jugadores...',
    startGame: 'Iniciar juego con {count} jugadores →',
    waitingHost: 'Esperando que el host inicie el juego...',
    errorNotEnough: 'Necesitas al menos 2 jugadores para iniciar.',
    errorTitle: 'Error',
  },

  // --- GameScreen ---
  game: {
    yourHand: 'Tu mano',
    yourPile: 'Tu pozo',
    discard: 'Descartar',
    staircases: 'Escaleras',
    yourTurn: '¡Es tu turno!',
    waitingTurn: 'Esperando tu turno...',
    playCard: 'Jugar carta',
    discardCard: 'Descartar carta',
    mustPlayAce: '⚠️ ¡Debes jugar tu As primero!',
    deckEmpty: '⚠️ ¡El mazo está vacío!',
    assignWild: 'Asignale un valor a este comodín (2–12)',
    assignConfirm: 'Confirmar',
    assignCancel: 'Cancelar',
  },

  // --- ResultScreen ---
  result: {
    winner: '🏆 ¡Ganador!',
    wins: '¡ganó la partida!',
    playAgain: 'Jugar de nuevo',
    backHome: 'Volver al inicio',
    turnCount: 'La partida duró {count} turnos',
  },

  // --- AuthScreen ---
  auth: {
    loginTitle: 'Bienvenido',
    registerTitle: 'Crear cuenta',
    username: 'Usuario',
    usernamePlaceholder: 'Ingresa tu usuario...',
    email: 'Email',
    emailPlaceholder: 'Ingresa tu email...',
    password: 'Contraseña',
    passwordPlaceholder: 'Ingresa tu contraseña...',
    loginButton: 'Iniciar sesión →',
    registerButton: 'Crear cuenta →',
    switchToRegister: '¿No tienes cuenta? Registrate',
    switchToLogin: '¿Ya tienes cuenta? Inicia sesión',
    loggingIn: 'Iniciando sesión...',
    registering: 'Creando cuenta...',
    logoutButton: 'Cerrar sesión',
    continueAsGuest: 'Continuar como invitado',
    errorTitle: 'Error',
    welcomeBack: 'Bienvenido,',
  },
};