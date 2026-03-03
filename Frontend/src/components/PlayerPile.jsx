// =============================================
// PlayerPile.jsx — Player's pile (21 cards stack)
// =============================================

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Card from './Card';
import useSettingsStore from '../store/settingsStore';

export default function PlayerPile({
  pileVisible,   // Array of visible cards (from getVisiblePileCards)
  pileCount,     // Total number of cards in the pile
  onPress,       // Called when tapping to play the top card
  isPlayable,    // Whether the top card can be played
  isOwner,       // Whether this pile belongs to the active player
  ownerName,     // Name of the pile owner
}) {
  const { theme, t } = useSettingsStore();
  const styles = makeStyles(theme);

  const topCard     = pileVisible?.[0] || null;
  const extraCards  = pileVisible?.slice(1) || [];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {isOwner ? t('game.yourPile') : `${ownerName}'s pile`}
      </Text>

      <View style={styles.cardStack}>
        {/* Stacked shadow cards behind */}
        {pileCount > 2 && <View style={[styles.shadowCard, styles.shadowCard3]} />}
        {pileCount > 1 && <View style={[styles.shadowCard, styles.shadowCard2]} />}

        {/* Top card — tappable if playable */}
        {topCard ? (
          <TouchableOpacity
            onPress={onPress}
            disabled={!isPlayable}
            activeOpacity={0.8}
          >
            <Card
              card={topCard}
              selected={isPlayable}
              disabled={!isPlayable}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyPile}>
            <Text style={styles.emptyPileText}>🏆</Text>
            <Text style={styles.emptyPileLabel}>Empty!</Text>
          </View>
        )}
      </View>

      {/* Extra visible cards (wilds reveal next card) — owner only */}
      {isOwner && extraCards.length > 0 && (
        <View style={styles.extraCards}>
          <Text style={styles.extraLabel}>Also visible:</Text>
          <View style={styles.extraRow}>
            {extraCards.map(card => (
              <Card key={card.id} card={card} small />
            ))}
          </View>
        </View>
      )}

      {/* Pile count */}
      <Text style={styles.count}>
        {pileCount} {pileCount === 1 ? 'card' : 'cards'}
      </Text>
    </View>
  );
}

function makeStyles(theme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      gap:        6,
    },
    label: {
      color:     theme.textSecondary,
      fontSize:  12,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    cardStack: {
      position: 'relative',
      width:    64,
      height:   100,
      alignItems: 'center',
    },
    shadowCard: {
      position:        'absolute',
      width:           64,
      height:          90,
      backgroundColor: theme.backgroundCard,
      borderRadius:    10,
      borderWidth:     1,
      borderColor:     theme.border,
    },
    shadowCard2: {
      top:   4,
      left:  4,
      opacity: 0.6,
    },
    shadowCard3: {
      top:   8,
      left:  8,
      opacity: 0.3,
    },
    emptyPile: {
      width:           64,
      height:          90,
      borderRadius:    10,
      borderWidth:     2,
      borderColor:     theme.success,
      borderStyle:     'dashed',
      justifyContent:  'center',
      alignItems:      'center',
      gap:             4,
    },
    emptyPileText: {
      fontSize: 24,
    },
    emptyPileLabel: {
      color:    theme.success,
      fontSize: 11,
      fontWeight: 'bold',
    },
    extraCards: {
      alignItems: 'center',
      gap:        4,
    },
    extraLabel: {
      color:    theme.textMuted,
      fontSize: 10,
    },
    extraRow: {
      flexDirection: 'row',
      gap:           4,
    },
    count: {
      color:    theme.textMuted,
      fontSize: 11,
    },
  });
}