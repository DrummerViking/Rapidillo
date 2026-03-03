// =============================================
// GameScreen.jsx — Main game screen (Part 1: Layout)
// =============================================

import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, Alert, Platform, Modal
} from 'react-native';

import useSettingsStore        from '../store/settingsStore';
import { getSocket }           from '../sockets/socketClient';
import Card                    from '../components/Card';
import Staircase               from '../components/Staircase';
import PlayerPile              from '../components/PlayerPile';
import DiscardRow              from '../components/DiscardRow';
import PlayerHand              from '../components/PlayerHand';

export default function GameScreen({ navigation, route }) {
  const { turnOrder, yourView, gameId, playerName } = route.params;

  // =============================================
  // LOCAL STATE
  // =============================================
  const [gameView,        setGameView]        = useState(yourView);
  const [selectedCard,    setSelectedCard]    = useState(null);   // { card, source, rowIndex? }
  const [turnSummary,     setTurnSummary]     = useState(null);
  const [statusMsg,       setStatusMsg]       = useState('');
  const [isMyTurn,        setIsMyTurn]        = useState(false);
  const [wildModalVisible, setWildModalVisible] = useState(false);
  const [pendingDiscard,   setPendingDiscard]   = useState(null); // { card, rowIndex }

  const { theme, t } = useSettingsStore();
  const styles = makeStyles(theme);

  // My player data from the view
  const myPlayer = gameView?.players?.find(p => p.name === playerName);

  // =============================================
  // DETERMINE IF IT'S MY TURN
  // =============================================
  useEffect(() => {
    if (!gameView) return;
    const activePlayer = gameView.players[gameView.currentPlayerIndex];
    const myTurn = activePlayer?.name === playerName;
    setIsMyTurn(myTurn);
    setStatusMsg(myTurn ? t('game.yourTurn') : `${activePlayer?.name}'s turn...`);

    // Clear selection when turn changes
    if (!myTurn) setSelectedCard(null);
  }, [gameView]);

  // =============================================
  // SOCKET EVENTS
  // =============================================
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function onGameUpdated({ yourView: newView, turnSummary: summary }) {
      console.log('gameUpdated received');
      setGameView(newView);
      setTurnSummary(summary);
      setSelectedCard(null);
    }

    function onActionRejected({ reason }) {
      console.warn('Action rejected:', reason);
      setStatusMsg(`❌ ${reason}`);
      if (Platform.OS === 'web') {
        window.alert(reason);
      } else {
        Alert.alert('Invalid action', reason);
      }
    }

    function onGameOver({ winner, message }) {
      navigation.navigate('Result', {
        winner,
        message,
        turnCount: turnSummary?.turnNumber || 0,
        gameId,
        playerName,
      });
    }

    socket.on('gameUpdated',    onGameUpdated);
    socket.on('actionRejected', onActionRejected);
    socket.on('gameOver',       onGameOver);

    return () => {
      socket.off('gameUpdated',    onGameUpdated);
      socket.off('actionRejected', onActionRejected);
      socket.off('gameOver',       onGameOver);
    };
  }, [turnSummary]);

  // =============================================
  // ACTION HELPERS
  // =============================================

  // Send any action to the server
  function sendAction(action) {
    const socket = getSocket();
    if (!socket) return;
    console.log('Sending action:', action);
    socket.emit('playerAction', { gameId, action });
  }

  // Select a card from hand
  function handleSelectFromHand(card) {
    if (!isMyTurn) return;

    // If already selected, deselect
    if (selectedCard?.card?.id === card.id) {
      setSelectedCard(null);
      return;
    }
    setSelectedCard({ card, source: 'hand' });
    setStatusMsg('Now tap a staircase to play, or a discard row to discard');
  }

  // Select the top card from pile
  function handleSelectFromPile() {
    if (!isMyTurn) return;
    const topCard = myPlayer?.pileVisible?.[0];
    if (!topCard) return;

    if (selectedCard?.source === 'pile') {
      setSelectedCard(null);
      return;
    }
    setSelectedCard({ card: topCard, source: 'pile' });
    setStatusMsg('Now tap a staircase to play this card');
  }

  // Select the top card from a discard row
  function handleSelectFromDiscard(rowIndex) {
    if (!isMyTurn) return;
    const row     = myPlayer?.discardRows?.[rowIndex];
    const topCard = row?.[row.length - 1];
    if (!topCard) return;

    if (selectedCard?.source === 'discard' && selectedCard?.rowIndex === rowIndex) {
      setSelectedCard(null);
      return;
    }
    setSelectedCard({ card: topCard, source: 'discard', rowIndex });
    setStatusMsg('Now tap a staircase to play this card');
  }

  // Play selected card on a staircase
  function handlePlayOnStaircase(staircaseIndex) {
    if (!selectedCard || !isMyTurn) return;

    sendAction({
      type:           'playCard',
      cardId:         selectedCard.card.id,
      source:         selectedCard.source,
      rowIndex:       selectedCard.rowIndex ?? null,
      staircaseIndex,
    });

    setSelectedCard(null);
  }

  // Discard selected card to a row
  function handleDiscardToRow(rowIndex) {
    if (!selectedCard || !isMyTurn) return;

    // Cannot discard pile cards
    if (selectedCard.source === 'pile') {
      setStatusMsg('❌ You cannot discard pile cards');
      return;
    }

    // If wild — show modal to assign a value
    if (selectedCard.card.isWild) {
      setPendingDiscard({ card: selectedCard.card, rowIndex });
      setWildModalVisible(true);
      return;
    }

    sendAction({
      type:    'discard',
      cardId:  selectedCard.card.id,
      rowIndex,
      assignedValue: null,
    });

    setSelectedCard(null);
  }

  // Confirm wild discard with assigned value
  function handleConfirmWild(assignedValue) {
    if (!pendingDiscard) return;

    sendAction({
      type:          'discard',
      cardId:        pendingDiscard.card.id,
      rowIndex:      pendingDiscard.rowIndex,
      assignedValue,
    });

    setWildModalVisible(false);
    setPendingDiscard(null);
    setSelectedCard(null);
  }

  // =============================================
  // RENDER — OTHER PLAYERS
  // =============================================
  function renderOtherPlayers() {
    const others = gameView?.players?.filter(p => p.name !== playerName) || [];

    return (
      <View style={styles.othersContainer}>
        {others.map(player => (
          <View key={player.id} style={[
            styles.otherPlayer,
            player.isActive && styles.otherPlayerActive
          ]}>
            {/* Name and turn indicator */}
            <Text style={styles.otherPlayerName}>
              {player.isActive ? '▶ ' : ''}{player.name}
              {player.isWinner ? ' 🏆' : ''}
            </Text>

            {/* Their pile */}
            <PlayerPile
              pileVisible={player.pileVisible}
              pileCount={player.pileCount}
              isOwner={false}
              ownerName={player.name}
            />

            {/* Their hand count */}
            <Text style={styles.otherHandCount}>
              ✋ {player.handCount} cards
            </Text>

            {/* Their discard rows */}
            <View style={styles.otherDiscardRows}>
              {player.discardRows?.map((row, i) => (
                <DiscardRow
                  key={i}
                  row={row}
                  rowIndex={i}
                  isOwner={false}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  }

  // =============================================
  // RENDER — STAIRCASES
  // =============================================
  function renderStaircases() {
    const staircases = gameView?.staircases || [];

    return (
      <View style={styles.staircasesContainer}>
        <Text style={styles.sectionLabel}>
          {t('game.staircases')} ({staircases.length})
        </Text>

        {staircases.length === 0 && (
          <View style={styles.emptyStaircases}>
            <Text style={styles.emptyStaircasesText}>
              No staircases yet — play an Ace to start one!
            </Text>
          </View>
        )}

        {staircases.map((staircase, i) => (
          <Staircase
            key={i}
            staircase={staircase}
            index={i}
            isPlayable={isMyTurn && !!selectedCard}
            onPress={() => handlePlayOnStaircase(i)}
          />
        ))}

        {/* "Start new staircase" button when holding an Ace */}
        {isMyTurn && selectedCard?.card?.value === 1 && (
          <TouchableOpacity
            style={styles.newStaircaseButton}
            onPress={() => handlePlayOnStaircase(staircases.length)}
          >
            <Text style={styles.newStaircaseText}>
              ➕ Play Ace — Start new staircase
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // =============================================
  // RENDER — MY DISCARD ROWS
  // =============================================
  function renderMyDiscardRows() {
    return (
      <View style={styles.discardRowsContainer}>
        <Text style={styles.sectionLabel}>{t('game.discard')}</Text>
        <View style={styles.discardRowsGrid}>
          {myPlayer?.discardRows?.map((row, i) => (
            <DiscardRow
              key={i}
              row={row}
              rowIndex={i}
              isOwner={isMyTurn}
              isTopPlayable={isMyTurn && !!selectedCard}
              isDiscardable={isMyTurn && !!selectedCard && selectedCard.source !== 'pile'}
              onPressTop={() => handleSelectFromDiscard(i)}
              onPressRow={() => handleDiscardToRow(i)}
            />
          ))}
        </View>
      </View>
    );
  }

  // =============================================
  // RENDER — WILD VALUE MODAL
  // =============================================
  function renderWildModal() {
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    return (
      <Modal
        visible={wildModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWildModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{t('game.assignWild')}</Text>

            <View style={styles.modalValues}>
              {values.map(v => (
                <TouchableOpacity
                  key={v}
                  style={styles.modalValueButton}
                  onPress={() => handleConfirmWild(v)}
                >
                  <Text style={styles.modalValueText}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => {
                setWildModalVisible(false);
                setPendingDiscard(null);
              }}
            >
              <Text style={styles.modalCancelText}>{t('game.assignCancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // =============================================
  // MAIN RENDER
  // =============================================
  if (!gameView) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* Status bar */}
      <View style={[styles.statusBar, isMyTurn && styles.statusBarMyTurn]}>
        <Text style={styles.statusText}>{statusMsg}</Text>
        <Text style={styles.deckCount}>
          🂠 {gameView.sharedDeckCount} cards
        </Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Other players */}
        {renderOtherPlayers()}

        {/* Staircases */}
        {renderStaircases()}

        {/* My pile and discard rows */}
        <View style={styles.myAreaTop}>
          <PlayerPile
            pileVisible={myPlayer?.pileVisible}
            pileCount={myPlayer?.pileCount}
            isOwner={isMyTurn}
            ownerName={playerName}
            isPlayable={isMyTurn && !!selectedCard && selectedCard.source !== 'pile'}
            onPress={handleSelectFromPile}
          />

          {renderMyDiscardRows()}
        </View>

      </ScrollView>

      {/* My hand — fixed at bottom */}
      <PlayerHand
        hand={myPlayer?.hand || []}
        selectedCardId={selectedCard?.card?.id}
        onSelectCard={handleSelectFromHand}
        isMyTurn={isMyTurn}
      />

      {/* Wild value assignment modal */}
      {renderWildModal()}

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
    loadingContainer: {
      flex:           1,
      justifyContent: 'center',
      alignItems:     'center',
    },
    loadingText: {
      color:    theme.textSecondary,
      fontSize: 16,
    },
    statusBar: {
      flexDirection:   'row',
      justifyContent:  'space-between',
      alignItems:      'center',
      paddingVertical:   10,
      paddingHorizontal: 16,
      backgroundColor:   theme.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    statusBarMyTurn: {
      backgroundColor: '#fff5f7',
      borderBottomColor: theme.accent,
    },
    statusText: {
      color:      theme.textPrimary,
      fontSize:   14,
      fontWeight: '600',
      flex:       1,
    },
    deckCount: {
      color:    theme.textMuted,
      fontSize: 13,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 12,
      gap:     12,
    },
    othersContainer: {
      gap: 10,
    },
    otherPlayer: {
      backgroundColor: theme.backgroundCard,
      borderRadius:    12,
      padding:         12,
      borderWidth:     1,
      borderColor:     theme.border,
      gap:             8,
    },
    otherPlayerActive: {
      borderColor: theme.accent,
      borderWidth: 2,
    },
    otherPlayerName: {
      color:      theme.textPrimary,
      fontWeight: 'bold',
      fontSize:   14,
    },
    otherHandCount: {
      color:    theme.textMuted,
      fontSize: 12,
    },
    otherDiscardRows: {
      flexDirection: 'row',
      gap:           6,
    },
    staircasesContainer: {
      gap: 8,
    },
    sectionLabel: {
      color:         theme.textSecondary,
      fontSize:      12,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom:  4,
    },
    emptyStaircases: {
      padding:         20,
      alignItems:      'center',
      backgroundColor: theme.backgroundCard,
      borderRadius:    12,
      borderWidth:     1,
      borderColor:     theme.border,
      borderStyle:     'dashed',
    },
    emptyStaircasesText: {
      color:    theme.textMuted,
      fontSize: 13,
    },
    newStaircaseButton: {
      backgroundColor: theme.accent,
      borderRadius:    10,
      padding:         12,
      alignItems:      'center',
    },
    newStaircaseText: {
      color:      '#fff',
      fontWeight: 'bold',
      fontSize:   14,
    },
    myAreaTop: {
      flexDirection: 'row',
      gap:           12,
      alignItems:    'flex-start',
    },
    discardRowsContainer: {
      flex: 1,
      gap:  6,
    },
    discardRowsGrid: {
      flexDirection: 'row',
      gap:           6,
      flexWrap:      'wrap',
    },
    modalOverlay: {
      flex:            1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent:  'center',
      alignItems:      'center',
    },
    modalContainer: {
      backgroundColor: theme.backgroundCard,
      borderRadius:    16,
      padding:         24,
      width:           '85%',
      gap:             16,
    },
    modalTitle: {
      color:      theme.textPrimary,
      fontSize:   16,
      fontWeight: 'bold',
      textAlign:  'center',
    },
    modalValues: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           8,
      justifyContent: 'center',
    },
    modalValueButton: {
      width:           44,
      height:          44,
      borderRadius:    10,
      backgroundColor: theme.background,
      borderWidth:     1,
      borderColor:     theme.border,
      justifyContent:  'center',
      alignItems:      'center',
    },
    modalValueText: {
      color:      theme.textPrimary,
      fontSize:   16,
      fontWeight: 'bold',
    },
    modalCancel: {
      paddingVertical: 12,
      alignItems:      'center',
      borderTopWidth:  1,
      borderTopColor:  theme.border,
    },
    modalCancelText: {
      color:    theme.textSecondary,
      fontSize: 15,
    },
  });
}