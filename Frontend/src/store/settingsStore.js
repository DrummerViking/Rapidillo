// =============================================
// settingsStore.js — App settings (theme, language)
// =============================================

import { create } from 'zustand';
import { darkTheme, lightTheme } from '../utils/themes';
import { LANGUAGES, t as translate } from '../locales/index';

const useSettingsStore = create((set, get) => ({

  // --- Theme ---
  isDarkMode: true,
  theme: darkTheme,
  toggleTheme: () => {
    const isDarkMode = !get().isDarkMode;
    set({ isDarkMode, theme: isDarkMode ? darkTheme : lightTheme });
  },

  // --- Language ---
  language: 'en', // Default language
  languages: LANGUAGES,

  setLanguage: (lang) => {
    if (LANGUAGES[lang]) set({ language: lang });
  },

  // Shortcut to translate — use this in every screen
  // Example: t('home.yourName') → "Your name"
  t: (key, params = {}) => translate(get().language, key, params),
}));

export default useSettingsStore;