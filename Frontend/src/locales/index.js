// =============================================
// index.js — Language engine
// =============================================

import en from './en';
import es from './es';

// All available languages
export const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧', translations: en },
  es: { label: 'Español', flag: '🇪🇸', translations: es },
};

// Translate a key — supports {placeholder} substitution
// Example: t('lobby.startGame', { count: 3 }) → "Start game with 3 players →"
export function t(language, key, params = {}) {
  const translations = LANGUAGES[language]?.translations || LANGUAGES['en'].translations;

  // Navigate nested keys like 'lobby.startGame'
  const value = key.split('.').reduce((obj, k) => obj?.[k], translations)
    ?? key; // Fallback to the key itself if not found

  // Replace {placeholders} with actual values
  return value.replace(/\{(\w+)\}/g, (_, param) => params[param] ?? `{${param}}`);
}