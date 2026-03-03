// =============================================
// PlayerHand.jsx — The player's hand (5 cards)
// =============================================

import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Card from './Card';
import useSettingsStore from '../store/settingsStore';

export default function PlayerHand({
  hand,             // Array of cards in hand
  selectedCardId,   // Currently selected card ID (null if none)
  onSelectCard,     // Called when a card is tapped
  isMyTurn,         // Whether it's this player's turn
}) {
  const { theme, t } = useSettingsStore();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>

      {/* Label */}
      <Text style={styles.label}>
        {t('game.yourHand')} ({hand.length})
      </Text>

      {/* Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsContent}
      >
        {hand.map(card => (
          <View key={card.id} style={styles.cardWrapper}>
            <Card
              card={card}
              selected={selectedCardId === card.id}
              onPress={isMyTurn ? () => onSelectCard(card) : null}
              disabled={!isMyTurn}
            />
          </View>
        ))}

        {/* Empty hand message */}
        {hand.length === 0 && (
          <View style={styles.emptyHand}>
            <Text style={styles.emptyHandText}>No cards in hand</Text>
          </View>
        )}
      </ScrollView>

      {/* Hint */}
      {isMyTurn && hand.length > 0 && (
        <Text style={styles.hint}>
          {selectedCardId ? 'Tap a staircase to play, or a discard row to discard' : 'Tap a card to select it'}
        </Text>
      )}

    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.backgroundCard,
      borderTopWidth:  1,
      borderTopColor:  theme.border,
      paddingTop:      12,
      paddingBottom:   16,
      paddingHorizontal: 16,
      gap:             8,
    },
    label: {
      color:         theme.textSecondary,
      fontSize:      12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    cardsContent: {
      gap:            10,
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    cardWrapper: {
      marginRight: 4,
    },
    emptyHand: {
      height:         90,
      justifyContent: 'center',
      alignItems:     'center',
      paddingHorizontal: 20,
    },
    emptyHandText: {
      color:    theme.textMuted,
      fontSize: 14,
    },
    hint: {
      color:     theme.textMuted,
      fontSize:  11,
      textAlign: 'center',
    },
  });
}