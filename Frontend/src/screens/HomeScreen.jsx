// =============================================
// HomeScreen.jsx — Main menu
// =============================================

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView,
  Platform, Switch
} from 'react-native';
import useSettingsStore from '../store/settingsStore';
import useAuthStore     from '../store/authStore';
import LanguagePicker   from '../components/LanguagePicker';

export default function HomeScreen({ navigation }) {
  const [playerName, setPlayerName] = useState('');
  const [gameId,     setGameId]     = useState('');
  const [mode,       setMode]       = useState(null); // 'create' | 'join' | null

  const { theme, isDarkMode, toggleTheme, t } = useSettingsStore();
  const { user, logout }                      = useAuthStore();
  const styles                                = makeStyles(theme);

  // =============================================
  // HANDLERS
  // =============================================
  function handleProceed() {
    if (!playerName.trim()) {
      if (Platform.OS === 'web') {
        window.alert(t('home.errorNoName'));
      } else {
        Alert.alert('Error', t('home.errorNoName'));
      }
      return;
    }

    if (mode === 'join' && !gameId.trim()) {
      if (Platform.OS === 'web') {
        window.alert(t('home.errorNoCode'));
      } else {
        Alert.alert('Error', t('home.errorNoCode'));
      }
      return;
    }

    const resolvedGameId = mode === 'create'
      ? `room-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      : gameId.trim().toUpperCase();

    navigation.navigate('Lobby', {
      playerName: playerName.trim(),
      gameId:     resolvedGameId,
      isHost:     mode === 'create'
    });
  }

  // =============================================
  // RENDER
  // =============================================
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >

        {/* Top controls — language picker + theme toggle */}
        <View style={styles.topControls}>
          <LanguagePicker />

          <View style={styles.themeToggle}>
            <Text style={styles.themeLabel}>☀️</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#e2e8f0', true: '#e94560' }}
              thumbColor="#ffffff"
            />
            <Text style={styles.themeLabel}>🌙</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>🃏 {t('appName')}</Text>
          <Text style={styles.subtitle}>{t('appSubtitle')}</Text>
        </View>

        {/* Help button */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => navigation.navigate('Help')}
        >
          <Text style={styles.helpButtonText}>❓ {t('help.title')}</Text>
        </TouchableOpacity>

        {/* Logged in user badge */}
        {user && (
          <View style={styles.userBadge}>
            <Text style={styles.userBadgeText}>
              👤 {t('auth.welcomeBack')} {user.username}
            </Text>
            <TouchableOpacity onPress={logout}>
              <Text style={styles.logoutText}>{t('auth.logoutButton')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile button — only if logged in */}
        {user && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileButtonText}>
              📊 {t('home.viewProfile')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Player name input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('home.yourName')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('home.namePlaceholder')}
            placeholderTextColor={theme.textMuted}
            value={playerName}
            onChangeText={setPlayerName}
            maxLength={20}
            autoCapitalize="words"
          />
        </View>

        {/* Mode selection — only show if name is entered */}
        {playerName.trim().length > 0 && (
          <View style={styles.modeContainer}>
            <Text style={styles.label}>{t('home.whatToDo')}</Text>

            <TouchableOpacity
              style={[styles.modeButton, mode === 'create' && styles.modeButtonActive]}
              onPress={() => setMode('create')}
            >
              <Text style={[styles.modeButtonText, mode === 'create' && styles.modeButtonTextActive]}>
                {t('home.createRoom')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeButton, mode === 'join' && styles.modeButtonActive]}
              onPress={() => setMode('join')}
            >
              <Text style={[styles.modeButtonText, mode === 'join' && styles.modeButtonTextActive]}>
                {t('home.joinRoom')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Room code input — only show if joining */}
        {mode === 'join' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('home.roomCode')}</Text>
            <TextInput
              style={[styles.input, styles.inputCode]}
              placeholder={t('home.roomCodeHint')}
              placeholderTextColor={theme.textMuted}
              value={gameId}
              onChangeText={text => setGameId(text.toUpperCase())}
              maxLength={12}
              autoCapitalize="characters"
            />
          </View>
        )}

        {/* Proceed button — only show if mode is selected */}
        {mode && (
          <TouchableOpacity style={styles.proceedButton} onPress={handleProceed}>
            <Text style={styles.proceedButtonText}>
              {mode === 'create' ? t('home.createButton') : t('home.joinButton')}
            </Text>
          </TouchableOpacity>
        )}

        {/* DEBUG BUTTON — remove before publishing */}
        {__DEV__ && (
          <TouchableOpacity
            style={[styles.proceedButton, { backgroundColor: '#888', marginTop: 0 }]}
            onPress={() => navigation.navigate('Result', {
              winner:     { name: 'testuser', id: 'player-1' },
              message:    '🏆 testuser wins!',
              turnCount:  42,
              playerName: 'testuser',
              finalStats: [
                { id: 'player-1', name: 'testuser',     position: 1, pileCount: 0, isWinner: true,  diceRoll: 6 },
                { id: 'player-2', name: 'guest-player', position: 2, pileCount: 8, isWinner: false, diceRoll: 3 },
              ]
            })}
          >
            <Text style={styles.proceedButtonText}>🧪 Test Result Screen</Text>
          </TouchableOpacity>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =============================================
// STYLES
// =============================================
function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex:            1,
      backgroundColor: theme.background,
    },
    inner: {
      flex:              1,
      justifyContent:    'center',
      paddingHorizontal: 32,
      gap:               20,
    },
    topControls: {
      position:       'absolute',
      top:            16,
      left:           16,
      right:          16,
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'center',
      zIndex:         10,
    },
    themeToggle: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           8,
    },
    themeLabel: {
      fontSize: 18,
    },
    titleContainer: {
      alignItems:   'center',
      marginBottom: 4,
    },
    title: {
      fontSize:      48,
      fontWeight:    'bold',
      color:         theme.textPrimary,
      letterSpacing: 2,
    },
    subtitle: {
      fontSize:      16,
      color:         theme.textSecondary,
      marginTop:     4,
      letterSpacing: 4,
      textTransform: 'uppercase',
    },
    helpButton: {
      alignSelf:       'center',
      paddingHorizontal: 16,
      paddingVertical:   8,
      borderRadius:    20,
      borderWidth:     1,
      borderColor:     theme.border,
      backgroundColor: theme.backgroundCard,
    },
    helpButtonText: {
      color:    theme.textSecondary,
      fontSize: 14,
    },
    userBadge: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      alignItems:     'center',
      backgroundColor: theme.backgroundCard,
      borderRadius:   12,
      padding:        12,
      borderWidth:    1,
      borderColor:    theme.border,
    },
    userBadgeText: {
      color:    theme.textPrimary,
      fontSize: 14,
    },
    logoutText: {
      color:    theme.accent,
      fontSize: 13,
    },
    profileButton: {
      backgroundColor: theme.backgroundCard,
      borderRadius:    12,
      paddingVertical: 12,
      alignItems:      'center',
      borderWidth:     1,
      borderColor:     theme.border,
    },
    profileButtonText: {
      color:    theme.textSecondary,
      fontSize: 14,
    },
    label: {
      color:         theme.textSecondary,
      fontSize:      13,
      marginBottom:  8,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    inputContainer: {
      gap: 4,
    },
    input: {
      backgroundColor:   theme.backgroundInput,
      color:             theme.textPrimary,
      borderRadius:      12,
      paddingHorizontal: 16,
      paddingVertical:   14,
      fontSize:          16,
      borderWidth:       1,
      borderColor:       theme.border,
    },
    inputCode: {
      letterSpacing: 4,
      textAlign:     'center',
      fontSize:      20,
      fontWeight:    'bold',
    },
    modeContainer: {
      gap: 12,
    },
    modeButton: {
      backgroundColor: theme.backgroundCard,
      borderRadius:    12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderWidth:     1,
      borderColor:     theme.border,
      alignItems:      'center',
    },
    modeButtonActive: {
      borderColor:     theme.borderActive,
      backgroundColor: theme.background,
    },
    modeButtonText: {
      color:      theme.textMuted,
      fontSize:   16,
      fontWeight: '600',
    },
    modeButtonTextActive: {
      color: theme.accent,
    },
    proceedButton: {
      backgroundColor: theme.accent,
      borderRadius:    12,
      paddingVertical: 18,
      alignItems:      'center',
      marginTop:       8,
    },
    proceedButtonText: {
      color:      theme.accentText,
      fontSize:   18,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
  });
}