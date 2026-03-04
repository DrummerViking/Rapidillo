// =============================================
// ResultScreen.jsx — Game over / Winner screen
// =============================================

import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  TouchableOpacity, Animated, ScrollView
} from 'react-native';
import useSettingsStore from '../store/settingsStore';
import { disconnectSocket } from '../sockets/socketClient';

export default function ResultScreen({ navigation, route }) {
  const { winner, message, turnCount, playerName, finalStats } = route.params;

  const { theme, t } = useSettingsStore();
  const styles = makeStyles(theme);

  const iWon = winner?.name === playerName;

  // =============================================
  // ANIMATIONS
  // =============================================
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    disconnectSocket();

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
  // RENDER — FINAL STANDINGS TABLE
  // =============================================
  function renderStandings() {
    if (!finalStats || finalStats.length === 0) return null;

    const sorted = [...finalStats].sort((a, b) => a.position - b.position);

    return (
      <View style={styles.standingsContainer}>
        <Text style={styles.standingsTitle}>Final standings</Text>

        {sorted.map((player, index) => (
          <View
            key={player.id}
            style={[
              styles.standingRow,
              player.name === playerName && styles.standingRowMe,
              player.isWinner && styles.standingRowWinner,
            ]}
          >
            {/* Position */}
            <Text style={styles.standingPosition}>
              {player.isWinner ? '🏆' : `#${player.position}`}
            </Text>

            {/* Name */}
            <Text style={styles.standingName}>
              {player.name}
              {player.name === playerName ? ' (you)' : ''}
            </Text>

            {/* Pile remaining */}
            <Text style={styles.standingPile}>
              {player.pileCount === 0
                ? '✅ Empty!'
                : `${player.pileCount} cards left`}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  // =============================================
  // RENDER
  // =============================================
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Background pattern */}
        <View style={styles.bgPattern}>
          {['🃏', '♠', '♥', '♦', '♣'].map((emoji, i) => (
            <Text key={i} style={[styles.bgEmoji, { opacity: 0.06 + i * 0.02 }]}>
              {emoji}
            </Text>
          ))}
        </View>

        {/* Winner card */}
        <Animated.View style={[
          styles.card,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
        ]}>

          <Text style={styles.mainEmoji}>
            {iWon ? '🏆' : '🃏'}
          </Text>

          <Text style={styles.title}>
            {iWon ? t('result.winner') : ''}
          </Text>

          <Text style={styles.winnerName}>{winner?.name}</Text>

          <Text style={styles.subtitle}>{t('result.wins')}</Text>

          <View style={styles.divider} />

          <Text style={styles.stats}>
            {t('result.turnCount', { count: turnCount })}
          </Text>

          {message && (
            <Text style={styles.message}>{message}</Text>
          )}

        </Animated.View>

        {/* Final standings */}
        {renderStandings()}

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.playAgainButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.playAgainText}>
              🔄 {t('result.playAgain')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.homeText}>
              🏠 {t('result.backHome')}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
    scrollContent: {
      flexGrow:       1,
      alignItems:     'center',
      padding:        24,
      gap:            20,
    },
    bgPattern: {
      position:       'absolute',
      top:            0, left: 0, right: 0, bottom: 0,
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
      fontSize:     72,
      marginBottom: 8,
    },
    title: {
      fontSize:      28,
      fontWeight:    'bold',
      color:         theme.accent,
      letterSpacing: 1,
    },
    winnerName: {
      fontSize:   32,
      fontWeight: 'bold',
      color:      theme.textPrimary,
      marginTop:  4,
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
    standingsContainer: {
      width:           '100%',
      maxWidth:        400,
      backgroundColor: theme.backgroundCard,
      borderRadius:    16,
      padding:         16,
      borderWidth:     1,
      borderColor:     theme.border,
      gap:             8,
    },
    standingsTitle: {
      color:         theme.textSecondary,
      fontSize:      13,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom:  4,
    },
    standingRow: {
      flexDirection:   'row',
      alignItems:      'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius:    10,
      backgroundColor: theme.background,
      gap:             12,
    },
    standingRowMe: {
      borderWidth: 1,
      borderColor: theme.accent,
    },
    standingRowWinner: {
      backgroundColor: '#fff9e6',
    },
    standingPosition: {
      fontSize:   18,
      fontWeight: 'bold',
      width:      32,
      textAlign:  'center',
    },
    standingName: {
      flex:       1,
      color:      theme.textPrimary,
      fontSize:   15,
      fontWeight: '600',
    },
    standingPile: {
      color:    theme.textMuted,
      fontSize: 13,
    },
    buttons: {
      width:    '100%',
      maxWidth: 400,
      gap:      12,
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