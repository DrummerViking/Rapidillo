// =============================================
// ProfileScreen.jsx — User profile and stats
// =============================================

import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, TouchableOpacity, ActivityIndicator
} from 'react-native';
import useSettingsStore from '../store/settingsStore';
import useAuthStore     from '../store/authStore';
import { api }          from '../utils/apiClient';

export default function ProfileScreen({ navigation }) {
  const [stats,     setStats]     = useState(null);
  const [history,   setHistory]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'history'

  const { theme, t }       = useSettingsStore();
  const { user, token, logout } = useAuthStore();
  const styles             = makeStyles(theme);

  // =============================================
  // LOAD PROFILE DATA
  // =============================================
  useEffect(() => {
    if (!user || !token) {
      setIsLoading(false);
      return;
    }
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setIsLoading(true);
      const [statsRes, historyRes] = await Promise.all([
        api.get('/profile/stats',   token),
        api.get('/profile/history', token),
      ]);
      setStats(statsRes.stats);
      setHistory(historyRes.history);
    } catch (err) {
      console.error('Failed to load profile:', err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // =============================================
  // RENDER — STAT CARD
  // =============================================
  function StatCard({ label, value, highlight }) {
    return (
      <View style={[styles.statCard, highlight && styles.statCardHighlight]}>
        <Text style={styles.statValue}>{value ?? '—'}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }

  // =============================================
  // RENDER — STATS TAB
  // =============================================
  function renderStats() {
    if (!stats) return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('profile.noHistory')}</Text>
      </View>
    );

    return (
      <View style={styles.statsContainer}>

        {/* Main stats grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label={t('profile.gamesPlayed')}
            value={stats.games_played}
          />
          <StatCard
            label={t('profile.gamesWon')}
            value={stats.games_won}
            highlight
          />
          <StatCard
            label={t('profile.winRate')}
            value={stats.win_rate ? `${stats.win_rate}%` : '0%'}
            highlight
          />
          <StatCard
            label={t('profile.avgTurns')}
            value={stats.avg_turns}
          />
        </View>

        {/* Best game */}
        {stats.best_game_turns && (
          <View style={styles.bestGameCard}>
            <Text style={styles.bestGameLabel}>{t('profile.bestGame')}</Text>
            <Text style={styles.bestGameValue}>
              {stats.best_game_turns} {t('profile.turns')}
            </Text>
          </View>
        )}

      </View>
    );
  }

  // =============================================
  // RENDER — HISTORY TAB
  // =============================================
  function renderHistory() {
    if (history.length === 0) return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('profile.noHistory')}</Text>
      </View>
    );

    return (
      <View style={styles.historyContainer}>
        {history.map((game, index) => {
          const isWinner = game.position === 1;
          const date     = new Date(game.finished_at).toLocaleDateString();

          return (
            <View
              key={index}
              style={[styles.historyRow, isWinner && styles.historyRowWinner]}
            >
              {/* Position badge */}
              <View style={[
                styles.positionBadge,
                isWinner && styles.positionBadgeWinner
              ]}>
                <Text style={styles.positionText}>
                  {isWinner ? '🏆' : `#${game.position}`}
                </Text>
              </View>

              {/* Game info */}
              <View style={styles.historyInfo}>
                <Text style={styles.historyWinner}>
                  {isWinner ? t('profile.winner') : `${t('profile.position')} #${game.position}`}
                </Text>
                <Text style={styles.historyDetails}>
                  {game.player_count} {t('profile.players')} · {game.turn_count} {t('profile.turns')} · {date}
                </Text>
              </View>

              {/* Pile remaining */}
              <Text style={styles.historyPile}>
                {game.final_pile === 0 ? '✅' : `${game.final_pile} left`}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }

  // =============================================
  // RENDER — NOT LOGGED IN
  // =============================================
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('profile.title')}</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.notLoggedIn}>
          <Text style={styles.notLoggedInEmoji}>🔒</Text>
          <Text style={styles.notLoggedInText}>{t('profile.notLoggedIn')}</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Auth')}
          >
            <Text style={styles.loginButtonText}>Go to Login →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // =============================================
  // RENDER — LOADING
  // =============================================
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={styles.loadingText}>{t('profile.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // =============================================
  // MAIN RENDER
  // =============================================
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <TouchableOpacity onPress={() => { logout(); navigation.navigate('Auth'); }}>
          <Text style={styles.logoutButton}>{t('auth.logoutButton')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>

        {/* User avatar and name */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Tab selector */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
            onPress={() => setActiveTab('stats')}
          >
            <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
              📊 {t('profile.stats')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
              📋 {t('profile.history')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {activeTab === 'stats'   && renderStats()}
          {activeTab === 'history' && renderHistory()}
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
    header: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
      paddingHorizontal: 16,
      paddingVertical:   12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize:   18,
      fontWeight: 'bold',
      color:      theme.textPrimary,
    },
    backButton: {
      color:    theme.accent,
      fontSize: 16,
      width:    60,
    },
    logoutButton: {
      color:    theme.accent,
      fontSize: 14,
    },
    scroll: {
      flex: 1,
    },
    loadingContainer: {
      flex:           1,
      justifyContent: 'center',
      alignItems:     'center',
      gap:            16,
    },
    loadingText: {
      color:    theme.textSecondary,
      fontSize: 16,
    },
    avatarContainer: {
      alignItems:    'center',
      paddingVertical: 28,
      gap:           8,
    },
    avatar: {
      width:           80,
      height:          80,
      borderRadius:    40,
      backgroundColor: theme.accent,
      justifyContent:  'center',
      alignItems:      'center',
    },
    avatarText: {
      color:      '#ffffff',
      fontSize:   36,
      fontWeight: 'bold',
    },
    username: {
      color:      theme.textPrimary,
      fontSize:   22,
      fontWeight: 'bold',
    },
    email: {
      color:    theme.textMuted,
      fontSize: 14,
    },
    tabs: {
      flexDirection:   'row',
      marginHorizontal: 16,
      backgroundColor:  theme.backgroundCard,
      borderRadius:     12,
      padding:          4,
      marginBottom:     16,
    },
    tab: {
      flex:            1,
      paddingVertical: 10,
      alignItems:      'center',
      borderRadius:    10,
    },
    tabActive: {
      backgroundColor: theme.accent,
    },
    tabText: {
      color:      theme.textSecondary,
      fontSize:   14,
      fontWeight: '600',
    },
    tabTextActive: {
      color: '#ffffff',
    },
    tabContent: {
      paddingHorizontal: 16,
      paddingBottom:     32,
    },
    statsContainer: {
      gap: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           12,
    },
    statCard: {
      flex:            1,
      minWidth:        '45%',
      backgroundColor: theme.backgroundCard,
      borderRadius:    14,
      padding:         16,
      alignItems:      'center',
      borderWidth:     1,
      borderColor:     theme.border,
      gap:             4,
    },
    statCardHighlight: {
      borderColor:     theme.accent,
      backgroundColor: theme.background,
    },
    statValue: {
      color:      theme.textPrimary,
      fontSize:   28,
      fontWeight: 'bold',
    },
    statLabel: {
      color:     theme.textMuted,
      fontSize:  12,
      textAlign: 'center',
    },
    bestGameCard: {
      backgroundColor: theme.backgroundCard,
      borderRadius:    14,
      padding:         16,
      flexDirection:   'row',
      justifyContent:  'space-between',
      alignItems:      'center',
      borderWidth:     1,
      borderColor:     theme.border,
    },
    bestGameLabel: {
      color:    theme.textSecondary,
      fontSize: 15,
    },
    bestGameValue: {
      color:      theme.accent,
      fontSize:   18,
      fontWeight: 'bold',
    },
    historyContainer: {
      gap: 10,
    },
    historyRow: {
      flexDirection:   'row',
      alignItems:      'center',
      backgroundColor: theme.backgroundCard,
      borderRadius:    12,
      padding:         12,
      borderWidth:     1,
      borderColor:     theme.border,
      gap:             12,
    },
    historyRowWinner: {
      borderColor: theme.accent,
    },
    positionBadge: {
      width:           40,
      height:          40,
      borderRadius:    20,
      backgroundColor: theme.background,
      justifyContent:  'center',
      alignItems:      'center',
      borderWidth:     1,
      borderColor:     theme.border,
    },
    positionBadgeWinner: {
      backgroundColor: '#fff9e6',
      borderColor:     theme.accent,
    },
    positionText: {
      fontSize:   16,
      fontWeight: 'bold',
      color:      theme.textPrimary,
    },
    historyInfo: {
      flex: 1,
      gap:  2,
    },
    historyWinner: {
      color:      theme.textPrimary,
      fontSize:   14,
      fontWeight: '600',
    },
    historyDetails: {
      color:    theme.textMuted,
      fontSize: 12,
    },
    historyPile: {
      color:    theme.textMuted,
      fontSize: 13,
    },
    emptyContainer: {
      paddingVertical: 40,
      alignItems:      'center',
    },
    emptyText: {
      color:    theme.textMuted,
      fontSize: 15,
    },
    notLoggedIn: {
      flex:           1,
      justifyContent: 'center',
      alignItems:     'center',
      gap:            16,
      padding:        32,
    },
    notLoggedInEmoji: {
      fontSize: 48,
    },
    notLoggedInText: {
      color:     theme.textSecondary,
      fontSize:  16,
      textAlign: 'center',
    },
    loginButton: {
      backgroundColor: theme.accent,
      borderRadius:    12,
      paddingVertical: 14,
      paddingHorizontal: 24,
    },
    loginButtonText: {
      color:      '#ffffff',
      fontSize:   16,
      fontWeight: 'bold',
    },
  });
}