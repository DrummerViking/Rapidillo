# 🤝 Contributing to Rapidillo

Thank you for your interest in contributing! Here's how you can help.

---

## 🌍 Adding a New Language

Adding a new language is simple and requires no programming experience.

1. Go to `frontend/src/locales/`
2. Copy `en.js` and rename it — e.g. `fr.js` for French
3. Translate all the **values** (never touch the keys)
4. Register the language in `frontend/src/locales/index.js`:
```javascript
import fr from './fr';

export const LANGUAGES = {
  en: { label: 'English', flag: '🇬🇧', translations: en },
  es: { label: 'Español', flag: '🇪🇸', translations: es },
  fr: { label: 'Français', flag: '🇫🇷', translations: fr }, // ← add here
};
```

5. Open a Pull Request with the title: `i18n: Add French translation`

### Translation rules
- ✅ Translate the values only
- ✅ Keep `{placeholders}` exactly as they are — e.g. `{count}`
- ✅ Keep emojis unless they are culturally inappropriate
- ❌ Never rename or delete keys
- ❌ Never modify `en.js` — it is the source of truth

---

## 🐛 Reporting Bugs

Open an issue with:
- A clear description of the bug
- Steps to reproduce it
- Expected vs actual behavior
- Your platform (Web / Android / iOS)

---

## 💡 Suggesting Features

Open an issue with the tag `enhancement` and describe:
- What the feature does
- Why it would improve the game
- Any ideas on how to implement it

---

## 🔧 Code Contributions

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test locally (backend + frontend)
5. Open a Pull Request with a clear description

### Code style guidelines
- Use English for all code, comments, and commit messages
- Follow the existing file structure
- Keep functions small and focused
- Add comments to non-obvious logic