// =============================================
// ResultScreen.jsx — Game over / Winner screen
// =============================================

import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Animated
} from 'react-native';
import useSettingsStore from '../store/settingsStore';
import { disconnectSocket } from '../sockets/socketClient';

export default function ResultScreen({ navigation, route }) {
  const { winner, message, turnCount, playerName } = route.params;

  const { theme, t } = useSettingsStore();
  const styles = makeStyles(theme);

  const iWon = winner?.name === playerName;

  // =============================================
  // ANIMATIONS
  // =============================================
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Disconnect socket when game ends
    disconnectSocket();

    // Animate the winner card in
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue:         1,
          friction:        5,
          tension:         40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue:         1,
          duration:        400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  // =============================================
  // HANDLERS
  // =============================================
  function handlePlayAgain() {
    navigation.navigate('Home');
  }

  function handleBackHome() {
    navigation.navigate('Home');
  }

  // =============================================
  // RENDER
  // =============================================
  return (
    <SafeAreaView style={styles.container}>

      {/* Background emoji pattern */}
      <View style={styles.bgPattern}>
        {['🃏', '♠', '♥', '♦', '♣'].map((emoji, i) => (
          <Text key={i} style={[styles.bgEmoji, { opacity: 0.06 + i * 0.02 }]}>
            {emoji}
          </Text>
        ))}
      </View>

      {/* Main content */}
      <Animated.View style={[
        styles.card,
        { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
      ]}>

        {/* Trophy or lose icon */}
        <Text style={styles.mainEmoji}>
          {iWon ? '🏆' : '🃏'}
        </Text>

        {/* Title */}
        <Text style={styles.title}>
          {iWon ? t('result.winner') : ''}
        </Text>

        {/* Winner name */}
        <Text style={styles.winnerName}>
          {winner?.name}
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {t('result.wins')}
        </Text>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Stats */}
        <Text style={styles.stats}>
          {t('result.turnCount', { count: turnCount })}
        </Text>

        {/* Message from server */}
        {message && (
          <Text style={styles.message}>{message}</Text>
        )}

      </Animated.View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={handlePlayAgain}
        >
          <Text style={styles.playAgainText}>
            🔄 {t('result.playAgain')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleBackHome}
        >
          <Text style={styles.homeText}>
            🏠 {t('result.backHome')}
          </Text>
        </TouchableOpacity>
      </View>

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
      justifyContent:  'center',
      alignItems:      'center',
      padding:         24,
    },
    bgPattern: {
      position:       'absolute',
      top:            0,
      left:           0,
      right:          0,
      bottom:         0,
      flexDirection:  'row',
      flexWrap:       'wrap',
      justifyContent: 'center',
      alignItems:     'center',
      gap:            40,
    },
    bgEmoji: {
      fontSize: 80,
    },
    card: {
      backgroundColor: theme.backgroundCard,
      borderRadius:    24,
      padding:         32,
      alignItems:      'center',
      width:           '100%',
      maxWidth:        400,
      borderWidth:     1,
      borderColor:     theme.border,
      gap:             8,
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 8 },
      shadowOpacity:   0.15,
      shadowRadius:    16,
      elevation:       8,
    },
    mainEmoji: {
      fontSize:    72,
      marginBottom: 8,
    },
    title: {
      fontSize:      28,
      fontWeight:    'bold',
      color:         theme.accent,
      letterSpacing: 1,
    },
    winnerName: {
      fontSize:      32,
      fontWeight:    'bold',
      color:         theme.textPrimary,
      marginTop:     4,
    },
    subtitle: {
      fontSize: 16,
      color:    theme.textSecondary,
    },
    divider: {
      width:           '60%',
      height:          1,
      backgroundColor: theme.border,
      marginVertical:  12,
    },
    stats: {
      fontSize: 14,
      color:    theme.textMuted,
    },
    message: {
      fontSize:  15,
      color:     theme.textSecondary,
      textAlign: 'center',
      marginTop: 4,
    },
    buttons: {
      width:     '100%',
      maxWidth:  400,
      marginTop: 32,
      gap:       12,
    },
    playAgainButton: {
      backgroundColor: theme.accent,
      borderRadius:    14,
      paddingVertical: 18,
      alignItems:      'center',
    },
    playAgainText: {
      color:      '#ffffff',
      fontSize:   17,
      fontWeight: 'bold',
    },
    homeButton: {
      backgroundColor: theme.backgroundCard,
      borderRadius:    14,
      paddingVertical: 16,
      alignItems:      'center',
      borderWidth:     1,
      borderColor:     theme.border,
    },
    homeText: {
      color:    theme.textSecondary,
      fontSize: 16,
    },
  });
}