// =============================================
// Card.jsx — Individual playing card
// =============================================

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useSettingsStore from '../store/settingsStore';

// Suit symbols and colors
const SUIT_SYMBOL = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLOR = {
  hearts: '#e94560',
  diamonds: '#e94560',
  clubs: '#1a1a2e',
  spades: '#1a1a2e',
};

export default function Card({
  card,
  onPress,
  selected = false,
  disabled = false,
  faceDown = false,
  small = false,
}) {
  const { theme } = useSettingsStore();
  const styles = makeStyles(theme, small);

  // --- Face down card (hidden) ---
  if (faceDown) {
    return (
      <View style={[styles.card, styles.cardFaceDown, small && styles.cardSmall]}>
        <Text style={styles.cardBackText}>🃏</Text>
      </View>
    );
  }

  if (!card) return null;

  // --- Wild card (K or Joker) ---
  if (card.isJoker) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.cardWild, selected && styles.cardSelected, small && styles.cardSmall]}
        onPress={onPress}
        disabled={disabled || !onPress}
      >
        <Text style={[styles.cardLabel, styles.cardLabelWild]}>★</Text>
        <Text style={[styles.cardSuit, styles.cardSuitWild]}>JOKER</Text>
        {card.assignedValue && (
          <View style={styles.assignedBadge}>
            <Text style={styles.assignedBadgeText}>{card.assignedValue}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  const suitSymbol = SUIT_SYMBOL[card.suit] || '?';
  const suitColor = card.isWild ? '#9b59b6' : (SUIT_COLOR[card.suit] || '#1a1a2e');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.cardSelected,
        disabled && styles.cardDisabled,
        small && styles.cardSmall,
        card.isWild && styles.cardWild,
      ]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      {/* Top left — value */}
      <Text style={[styles.cardLabel, { color: suitColor }]}>
        {card.label}
      </Text>

      {/* Center — suit symbol */}
      <Text style={[styles.cardSuit, { color: suitColor }]}>
        {card.isWild ? '★' : suitSymbol}
      </Text>

      {/* Bottom right — value (rotated) */}
      <Text style={[styles.cardLabelBottom, { color: suitColor }]}>
        {card.label}
      </Text>

      {/* Assigned value badge for discarded wilds */}
      {card.assignedValue && (
        <View style={styles.assignedBadge}>
          <Text style={styles.assignedBadgeText}>{card.assignedValue}</Text>
        </View>
      )}

      {/* Selected indicator */}
      {selected && <View style={styles.selectedIndicator} />}
    </TouchableOpacity>
  );
}

function makeStyles(theme, small) {
  const width = small ? 40 : 64;
  const height = small ? 56 : 90;

  return StyleSheet.create({
    card: {
      width,
      height,
      backgroundColor: theme.cardBackground,
      borderRadius: small ? 6 : 10,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: small ? 3 : 6,
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    cardSmall: {
      width: 40,
      height: 56,
    },
    cardFaceDown: {
      backgroundColor: '#1a3a5c',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardBackText: {
      fontSize: small ? 16 : 24,
    },
    cardWild: {
      backgroundColor: '#f8f0ff',
      borderColor: '#9b59b6',
    },
    cardSelected: {
      borderColor: theme.accent,
      borderWidth: 2,
      transform: [{ translateY: -8 }],
    },
    cardDisabled: {
      opacity: 0.4,
    },
    cardLabel: {
      fontSize: small ? 10 : 14,
      fontWeight: 'bold',
      alignSelf: 'flex-start',
    },
    cardLabelWild: {
      color: '#9b59b6',
    },
    cardSuit: {
      fontSize: small ? 14 : 22,
    },
    cardSuitWild: {
      color: '#9b59b6',
      fontSize: small ? 10 : 14,
    },
    cardLabelBottom: {
      fontSize: small ? 10 : 14,
      fontWeight: 'bold',
      alignSelf: 'flex-end',
      transform: [{ rotate: '180deg' }],
    },
    assignedBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: '#9b59b6',
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 1,
    },
    assignedBadgeText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: 'bold',
    },
    selectedIndicator: {
      position: 'absolute',
      bottom: -4,
      left: '50%',
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.accent,
    },
  });
}