// =============================================
// AuthScreen.jsx — Login and Register
// =============================================

import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Platform,
  ActivityIndicator, KeyboardAvoidingView, ScrollView
} from 'react-native';
import useSettingsStore from '../store/settingsStore';
import useAuthStore from '../store/authStore';
import { api } from '../utils/apiClient';

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('login');    // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { theme, t } = useSettingsStore();
  const { setAuth } = useAuthStore();
  const styles = makeStyles(theme);

  const isLogin = mode === 'login';

  // =============================================
  // HANDLERS
  // =============================================
  function getPasswordStrength(password) {
    if (!password) return { score: 0, checks: [] };

    const checks = [
      { label: '8+ characters', pass: password.length >= 8 },
      { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
      { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
      { label: 'Number', pass: /[0-9]/.test(password) },
      { label: 'Special character', pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
    ];

    const score = checks.filter(c => c.pass).length;
    return { score, checks };
  }

  async function handleSubmit() {
    // Basic validation
    if (!username.trim()) {
      showError(t('auth.errorTitle'), t('auth.usernamePlaceholder'));
      return;
    }
    if (!isLogin && !email.trim()) {
      showError(t('auth.errorTitle'), t('auth.emailPlaceholder'));
      return;
    }
    if (!password.trim()) {
      showError(t('auth.errorTitle'), t('auth.passwordPlaceholder'));
      return;
    }

    setIsLoading(true);

    try {
      let result;

      if (isLogin) {
        result = await api.post('/auth/login', { username, password });
      } else {
        result = await api.post('/auth/register', { username, email, password });
      }

      // Save auth state globally
      setAuth(result.user, result.token);

      // Navigate to Home
      navigation.navigate('Home');

    } catch (err) {
      showError(t('auth.errorTitle'), err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleGuestMode() {
    // Skip auth — navigate directly to Home without logging in
    navigation.navigate('Home');
  }

  function showError(title, message) {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.appName}>🃏 Rapidillo</Text>
            <Text style={styles.title}>
              {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>

            {/* Username */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('auth.username')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.usernamePlaceholder')}
                placeholderTextColor={theme.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                maxLength={30}
              />
            </View>

            {/* Email — only for register */}
            {!isLogin && (
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>{t('auth.email')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('auth.emailPlaceholder')}
                  placeholderTextColor={theme.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  maxLength={100}
                />
              </View>
            )}

            {/* Password */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>{t('auth.password')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('auth.passwordPlaceholder')}
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                maxLength={100}
              />

              {/* Password strength indicator — only on register */}
              {!isLogin && password.length > 0 && (() => {
                const { score, checks } = getPasswordStrength(password);
                const strengthColors = ['#f44336', '#ff9800', '#ff9800', '#8bc34a', '#4caf50'];
                const strengthLabels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
                const color = strengthColors[score - 1] || '#f44336';

                return (
                  <View style={styles.strengthContainer}>

                    {/* Strength bar */}
                    <View style={styles.strengthBar}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <View
                          key={i}
                          style={[
                            styles.strengthSegment,
                            { backgroundColor: i <= score ? color : theme.border }
                          ]}
                        />
                      ))}
                    </View>

                    {/* Strength label */}
                    <Text style={[styles.strengthLabel, { color }]}>
                      {strengthLabels[score - 1] || 'Very weak'}
                    </Text>

                    {/* Checklist */}
                    <View style={styles.checkList}>
                      {checks.map((check, i) => (
                        <Text
                          key={i}
                          style={[
                            styles.checkItem,
                            { color: check.pass ? theme.success : theme.textMuted }
                          ]}
                        >
                          {check.pass ? '✅' : '○'} {check.label}
                        </Text>
                      ))}
                    </View>

                  </View>
                );
              })()}
            </View>

          </View>

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitButtonText}>
                {isLogin ? t('auth.loginButton') : t('auth.registerButton')}
              </Text>
            }
          </TouchableOpacity>

          {/* Switch mode */}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => {
              setMode(isLogin ? 'register' : 'login');
              setEmail('');
              setPassword('');
            }}
          >
            <Text style={styles.switchText}>
              {isLogin ? t('auth.switchToRegister') : t('auth.switchToLogin')}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.divider} />
          </View>

          {/* Guest mode */}
          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestMode}
          >
            <Text style={styles.guestText}>
              👤 {t('auth.continueAsGuest')}
            </Text>
          </TouchableOpacity>

        </ScrollView>
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
      flex: 1,
      backgroundColor: theme.background,
    },
    inner: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 32,
      paddingVertical: 40,
      gap: 20,
    },
    titleContainer: {
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    appName: {
      fontSize: 36,
      fontWeight: 'bold',
      color: theme.textPrimary,
      letterSpacing: 2,
    },
    title: {
      fontSize: 18,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    form: {
      gap: 16,
    },
    fieldContainer: {
      gap: 6,
    },
    label: {
      color: theme.textSecondary,
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    input: {
      backgroundColor: theme.backgroundInput,
      color: theme.textPrimary,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    submitButton: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: 18,
      alignItems: 'center',
      marginTop: 8,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: '#ffffff',
      fontSize: 17,
      fontWeight: 'bold',
    },
    strengthContainer: {
      marginTop: 8,
      gap: 6,
    },
    strengthBar: {
      flexDirection: 'row',
      gap: 4,
    },
    strengthSegment: {
      flex: 1,
      height: 4,
      borderRadius: 2,
    },
    strengthLabel: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    checkList: {
      gap: 3,
      marginTop: 2,
    },
    checkItem: {
      fontSize: 12,
    },
    switchButton: {
      alignItems: 'center',
      padding: 8,
    },
    switchText: {
      color: theme.accent,
      fontSize: 14,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
    },
    dividerText: {
      color: theme.textMuted,
      fontSize: 13,
    },
    guestButton: {
      backgroundColor: theme.backgroundCard,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    guestText: {
      color: theme.textSecondary,
      fontSize: 15,
    },
  });
}