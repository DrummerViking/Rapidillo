// =============================================
// index.js — Language engine
// =============================================

import en    from './en';
import es    from './es';
import pt_BR from './pt_BR';
import it    from './it';
import fr    from './fr';
import de    from './de';

export const LANGUAGES = {
  en:    { label: 'English',              flag: '🇬🇧', translations: en    },
  es:    { label: 'Español',              flag: '🇪🇸', translations: es    },
  pt_BR: { label: 'Português (Brasil)',   flag: '🇧🇷', translations: pt_BR },
  it:    { label: 'Italiano',             flag: '🇮🇹', translations: it    },
  fr:    { label: 'Français',             flag: '🇫🇷', translations: fr    },
  de:    { label: 'Deutsch',              flag: '🇩🇪', translations: de    },
};

export function t(language, key, params = {}) {
  const translations = LANGUAGES[language]?.translations || LANGUAGES['en'].translations;

  const value = key.split('.').reduce((obj, k) => obj?.[k], translations) ?? key;

  return value.replace(/\{(\w+)\}/g, (_, param) => params[param] ?? `{${param}}`);
}