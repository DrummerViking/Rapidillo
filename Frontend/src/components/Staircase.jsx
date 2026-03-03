// =============================================
// Staircase.jsx — A staircase on the shared table
// =============================================

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Card from './Card';
import useSettingsStore from '../store/settingsStore';

export default function Staircase({
  staircase,      // Array of cards
  index,          // Staircase index
  onPress,        // Called when tapping the staircase to play a card
  isPlayable,     // Whether the active player can play here
}) {
  const { theme, t } = useSettingsStore();
  const styles = makeStyles(theme);

  const nextValue  = staircase.length + 1;
  const isComplete = staircase.length >= 12;

  return (
    <TouchableOpacity
      style={[styles.container, isPlayable && styles.containerPlayable, isComplete && styles.containerComplete]}
      onPress={onPress}
      disabled={!isPlayable}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {isComplete ? '✅ Complete' : `Staircase ${index + 1}`}
        </Text>
        <Text style={styles.nextText}>
          {isComplete ? 'Returning to deck...' : `Next: ${nextValue > 12 ? '—' : nextValue}`}
        </Text>
      </View>

      {/* Cards row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardsScroll}>
        <View style={styles.cardsRow}>
          {staircase.map((card, i) => (
            <View key={card.id} style={styles.cardWrapper}>
              <Card card={card} small />
            </View>
          ))}

          {/* Empty placeholder if staircase is empty */}
          {staircase.length === 0 && (
            <View style={styles.emptySlot}>
              <Text style={styles.emptySlotText}>A</Text>
            </View>
          )}

          {/* Next slot indicator */}
          {!isComplete && (
            <View style={[styles.nextSlot, isPlayable && styles.nextSlotPlayable]}>
              <Text style={[styles.nextSlotText, isPlayable && styles.nextSlotTextPlayable]}>
                {nextValue}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(staircase.length / 12) * 100}%` }]} />
      </View>
      <Text style={styles.progressText}>{staircase.length}/12</Text>

    </TouchableOpacity>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.backgroundCard,
      borderRadius:    12,
      padding:         12,
      marginBottom:    10,
      borderWidth:     1,
      borderColor:     theme.border,
    },
    containerPlayable: {
      borderColor:     theme.accent,
      borderWidth:     2,
      backgroundColor: theme.background,
    },
    containerComplete: {
      opacity:     0.6,
      borderColor: theme.success,
    },
    header: {
      flexDirection:  'row',
      justifyContent: 'space-between',
      marginBottom:   8,
    },
    headerText: {
      color:      theme.textPrimary,
      fontWeight: 'bold',
      fontSize:   13,
    },
    nextText: {
      color:    theme.accent,
      fontSize: 13,
    },
    cardsScroll: {
      marginBottom: 8,
    },
    cardsRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           4,
      paddingRight:  8,
    },
    cardWrapper: {
      marginRight: 2,
    },
    emptySlot: {
      width:           40,
      height:          56,
      borderRadius:    6,
      borderWidth:     2,
      borderColor:     theme.border,
      borderStyle:     'dashed',
      justifyContent:  'center',
      alignItems:      'center',
    },
    emptySlotText: {
      color:      theme.textMuted,
      fontWeight: 'bold',
    },
    nextSlot: {
      width:           40,
      height:          56,
      borderRadius:    6,
      borderWidth:     2,
      borderColor:     theme.border,
      borderStyle:     'dashed',
      justifyContent:  'center',
      alignItems:      'center',
    },
    nextSlotPlayable: {
      borderColor:     theme.accent,
      backgroundColor: '#fff5f7',
    },
    nextSlotText: {
      color:      theme.textMuted,
      fontWeight: 'bold',
      fontSize:   16,
    },
    nextSlotTextPlayable: {
      color: theme.accent,
    },
    progressBar: {
      height:          4,
      backgroundColor: theme.border,
      borderRadius:    2,
      marginTop:       4,
      overflow:        'hidden',
    },
    progressFill: {
      height:          4,
      backgroundColor: theme.accent,
      borderRadius:    2,
    },
    progressText: {
      color:     theme.textMuted,
      fontSize:  11,
      textAlign: 'right',
      marginTop: 2,
    },
  });
}