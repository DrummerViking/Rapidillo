// =============================================
// LobbyScreen.jsx — Waiting room before game starts
// =============================================

import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, FlatList, Alert, ActivityIndicator
} from 'react-native';
import useSettingsStore from '../store/settingsStore';
import { getSocket, connectSocket } from '../sockets/socketClient';

export default function LobbyScreen({ navigation, route }) {
  const { playerName, gameId, isHost } = route.params;

  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState(t('lobby.connecting'));

  const { theme, t, language, languages, setLanguage } = useSettingsStore();
  const styles = makeStyles(theme);

  // =============================================
  // CONNECT TO SERVER AND SET UP SOCKET EVENTS
  // =============================================
  useEffect(() => {
    const socket = connectSocket();

    // --- Connected to server ---
    socket.on('connect', () => {
      setIsLoading(false);
      setStatusMsg(isHost ? t('lobby.roomCreated') : t('lobby.waitingForHost'));

      if (isHost) {
        socket.emit('createRoom', { gameId, playerName });
      } else {
        socket.emit('joinRoom', { gameId, playerName });
      }
    });

    // --- Room created confirmation (host only) ---
    socket.on('roomCreated', ({ players }) => {
      setPlayers(players);
    });

    // --- A new player joined ---
    socket.on('playerJoined', ({ players, playerName: newPlayer }) => {
      setPlayers(players);
      setStatusMsg(`${newPlayer} ${t('lobby.playerJoined')}`);
    });

    // --- Game started ---
    socket.on('gameStarted', ({ turnOrder, yourView }) => {
      navigation.navigate('Game', { turnOrder, yourView, gameId, playerName });
    });

    // --- Error from server ---
    socket.on('error', ({ message }) => {
      Alert.alert('Error', message);
      setIsLoading(false);
    });

    // --- Cleanup on unmount ---
    return () => {
      socket.off('connect');
      socket.off('roomCreated');
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('error');
    };
  }, []);

  // =============================================
  // START GAME (host only)
  // =============================================
  function handleStartGame() {
    if (players.length < 2) {
      Alert.alert('Not enough players', t('lobby.errorNotEnough'));
      return;
    }
    const socket = getSocket();
    socket.emit('startGame', { gameId });
  }

  // =============================================
  // LEAVE ROOM
  // =============================================
  function handleLeave() {
    Alert.alert(
      t('lobby.leaveTitle'),
      t('lobby.leaveMessage'),
      [
        { text: t('lobby.leaveCancel'), style: 'cancel' },
        { text: t('lobby.leaveConfirm'), style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  }

  // =============================================
  // RENDER A PLAYER ROW
  // =============================================
  function renderPlayer({ item, index }) {
    const isMe = item.name === playerName;
    return (
      <View style={[styles.playerRow, isMe && styles.playerRowMe]}>
        <View style={styles.playerAvatar}>
          <Text style={styles.playerAvatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.playerName, isMe && styles.playerNameMe]}>
          {item.name} {isMe ? t('lobby.you') : ''} {index === 0 ? '👑' : ''}
        </Text>
        <View style={styles.playerReady}>
          <Text style={styles.playerReadyText}>✅ Ready</Text>
        </View>
      </View>
    );
  }

  // =============================================
  // RENDER
  // =============================================
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeave} style={styles.leaveButton}>
          <Text style={styles.leaveButtonText}>{t('lobby.leave')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('lobby.title')}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Room code */}
      <View style={styles.roomCodeContainer}>
        <Text style={styles.roomCodeLabel}>{t('lobby.roomCodeLabel')}</Text>
        <Text style={styles.roomCode}>{gameId}</Text>
        <Text style={styles.roomCodeHint}>{t('lobby.roomCodeHint')}</Text>
      </View>

      {/* Status message */}
      <View style={styles.statusContainer}>
        {isLoading && <ActivityIndicator color={theme.accent} style={{ marginRight: 8 }} />}
        <Text style={styles.statusText}>{statusMsg}</Text>
      </View>

      {/* Players list */}
      <View style={styles.playersContainer}>
        <Text style={styles.playersTitle}>
          {t('lobby.players')} ({players.length}/6)
        </Text>
        <FlatList
          data={players}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayer}
          style={styles.playersList}
        />
      </View>

      {/* Start button (host only) */}
      {isHost && (
        <TouchableOpacity
          style={[
            styles.startButton,
            players.length < 2 && styles.startButtonDisabled
          ]}
          onPress={handleStartGame}
          disabled={players.length < 2}
        >
          <Text style={styles.startButtonText}>
            {players.length < 2
              ? t('lobby.waitingPlayers')
              : t('lobby.startGame', { count: players.length })}
          </Text>
        </TouchableOpacity>
      )}

      {/* Waiting message (non-host) */}
      {!isHost && (
        <View style={styles.waitingContainer}>
          <ActivityIndicator color={theme.accent} />
          <Text style={styles.waitingText}>{t('lobby.waitingForHost')}</Text>
        </View>
      )}

    </SafeAreaView>
  );
}

// =============================================
// STYLES
// =============================================
function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    leaveButton: {
      width: 60,
    },
    leaveButtonText: {
      color: theme.accent,
      fontSize: 16,
    },
    roomCodeContainer: {
      alignItems: 'center',
      paddingVertical: 24,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    roomCodeLabel: {
      color: theme.textSecondary,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 8,
    },
    roomCode: {
      color: theme.accent,
      fontSize: 32,
      fontWeight: 'bold',
      letterSpacing: 6,
    },
    roomCodeHint: {
      color: theme.textMuted,
      fontSize: 12,
      marginTop: 8,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      backgroundColor: theme.backgroundCard,
    },
    statusText: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    playersContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    playersTitle: {
      color: theme.textSecondary,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
    },
    playersList: {
      flex: 1,
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundCard,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 12,
    },
    playerRowMe: {
      borderColor: theme.accent,
    },
    playerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playerAvatarText: {
      color: '#ffffff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    playerName: {
      flex: 1,
      color: theme.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    playerNameMe: {
      color: theme.accent,
    },
    playerReady: {
      backgroundColor: theme.background,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    playerReadyText: {
      fontSize: 12,
      color: theme.success,
    },
    startButton: {
      backgroundColor: theme.accent,
      margin: 16,
      borderRadius: 12,
      paddingVertical: 18,
      alignItems: 'center',
    },
    startButtonDisabled: {
      backgroundColor: theme.backgroundButton,
    },
    startButtonText: {
      color: theme.accentText,
      fontSize: 16,
      fontWeight: 'bold',
    },
    waitingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      padding: 24,
    },
    waitingText: {
      color: theme.textSecondary,
      fontSize: 14,
    },
  });
}