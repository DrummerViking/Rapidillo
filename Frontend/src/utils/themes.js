// =============================================
// themes.js — Light and dark theme definitions
// =============================================

export const darkTheme = {
  name: 'dark',

  // Backgrounds
  background:        '#1a1a2e',
  backgroundCard:    '#16213e',
  backgroundInput:   '#16213e',
  backgroundButton:  '#2a2a4a',

  // Text
  textPrimary:       '#ffffff',
  textSecondary:     '#aaaaaa',
  textMuted:         '#666666',

  // Accent (main color — buttons, highlights)
  accent:            '#e94560',
  accentText:        '#ffffff',

  // Cards
  cardBackground:    '#ffffff',
  cardText:          '#1a1a2e',
  cardBorder:        '#dddddd',

  // Borders
  border:            '#2a2a4a',
  borderActive:      '#e94560',

  // Status
  success:           '#4caf50',
  warning:           '#ff9800',
  error:             '#f44336',
};

export const lightTheme = {
  name: 'light',

  // Backgrounds
  background:        '#f0f4f8',
  backgroundCard:    '#ffffff',
  backgroundInput:   '#ffffff',
  backgroundButton:  '#e2e8f0',

  // Text
  textPrimary:       '#1a202c',
  textSecondary:     '#4a5568',
  textMuted:         '#a0aec0',

  // Accent
  accent:            '#e94560',
  accentText:        '#ffffff',

  // Cards
  cardBackground:    '#ffffff',
  cardText:          '#1a202c',
  cardBorder:        '#e2e8f0',

  // Borders
  border:            '#e2e8f0',
  borderActive:      '#e94560',

  // Status
  success:           '#48bb78',
  warning:           '#ed8936',
  error:             '#f56565',
};