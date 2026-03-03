// =============================================
// DiscardRow.jsx — A single discard row (LIFO)
// =============================================

import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Card from './Card';
import useSettingsStore from '../store/settingsStore';

export default function DiscardRow({
  row,          // Array of cards in this row
  rowIndex,     // Row index (0–3)
  onPressTop,   // Called when tapping the top card to play it
  onPressRow,   // Called when tapping the row to discard here
  isTopPlayable,  // Whether the top card can be played on a staircase
  isDiscardable,  // Whether the player can discard to this row
  isOwner,        // Whether this row belongs to the active player
}) {
  const { theme } = useSettingsStore();
  const styles = makeStyles(theme);

  const topCard     = row.length > 0 ? row[row.length - 1] : null;
  const belowCards  = row.slice(0, -1);

  return (
    <View style={styles.container}>

      {/* Row label */}
      <Text style={styles.label}>Row {rowIndex + 1}</Text>

      {/* Cards — scrollable, newest on top (right) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContent}
        style={styles.cardsScroll}
      >
        {/* Below cards (not tappable) */}
        {belowCards.map(card => (
          <View key={card.id} style={styles.belowCard}>
            <Card card={card} small />
          </View>
        ))}

        {/* Top card (tappable) */}
        {topCard ? (
          <TouchableOpacity
            onPress={onPressTop}
            disabled={!isTopPlayable || !isOwner}
            activeOpacity={0.8}
          >
            <Card
              card={topCard}
              small
              selected={isTopPlayable && isOwner}
            />
          </TouchableOpacity>
        ) : (
          // Empty row — tap to discard here
          <TouchableOpacity
            style={[styles.emptyRow, isDiscardable && isOwner && styles.emptyRowActive]}
            onPress={onPressRow}
            disabled={!isDiscardable || !isOwner}
          >
            <Text style={styles.emptyRowText}>+</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Discard here button — only show for owner */}
      {isOwner && isDiscardable && topCard && (
        <TouchableOpacity style={styles.discardHereButton} onPress={onPressRow}>
          <Text style={styles.discardHereText}>↓ Discard here</Text>
        </TouchableOpacity>
      )}

      {/* Card count */}
      <Text style={styles.count}>{row.length} cards</Text>

    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      flex:       1,
      alignItems: 'center',
      gap:        4,
    },
    label: {
      color:         theme.textSecondary,
      fontSize:      11,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardsScroll: {
      maxWidth: '100%',
    },
    cardsContent: {
      alignItems:  'flex-end',
      paddingRight: 4,
      gap:          3,
    },
    belowCard: {
      opacity: 0.7,
    },
    emptyRow: {
      width:           40,
      height:          56,
      borderRadius:    6,
      borderWidth:     2,
      borderStyle:     'dashed',
      borderColor:     theme.border,
      justifyContent:  'center',
      alignItems:      'center',
    },
    emptyRowActive: {
      borderColor: theme.accent,
    },
    emptyRowText: {
      color:    theme.textMuted,
      fontSize: 20,
    },
    discardHereButton: {
      paddingHorizontal: 6,
      paddingVertical:   3,
      borderRadius:      6,
      backgroundColor:   theme.backgroundButton,
    },
    discardHereText: {
      color:    theme.textSecondary,
      fontSize: 10,
    },
    count: {
      color:    theme.textMuted,
      fontSize: 10,
    },
  });
}