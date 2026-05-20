export const Colors = {
  // Light Mode (Défaut)
  light: {
    primary:    '#800020',
    secondary:  '#FFDB58',
    tertiary:   '#4D0013',
    neutral:    '#FAF7F2',
    graphite:   '#222222',
    dustGrey:   '#CFCFCF',
    white:      '#FFFFFF',
    black:      '#000000',

    // Variantes
    primaryLight:   '#80002015',
    secondaryLight: '#FFDB5825',
    tertiaryLight:  '#4D001315',

    // Statuts
    success: '#2D6A4F',
    warning: '#7A5F00',
    danger:  '#4D0013',
    info:    '#1A56DB',

    // Textes
    textPrimary:   '#222222',
    textSecondary: '#888888',
    textMuted:     '#AAAAAA',

    // Bordures
    border:      '#CFCFCF',
    borderLight: '#E8E4DC',

    // Background
    background:  '#FAF7F2',
    surface:     '#FFFFFF',
    surfaceHigh: '#FFFFFF',
  },

  // Dark Mode
  dark: {
    primary:    '#ffb2b9',
    secondary:  '#e6c443',
    tertiary:   '#dac0c5',
    neutral:    '#191113',
    graphite:   '#efdee1',
    dustGrey:   '#594142',
    white:      '#191113',
    black:      '#efdee1',

    // Variantes
    primaryLight:   '#a61c3c80',
    secondaryLight: '#ac8e0140',
    tertiaryLight:  '#6451561a',

    // Statuts
    success: '#4CAF50',
    warning: '#FFB74D',
    danger:  '#ffb4ab',
    info:    '#64B5F6',

    // Textes
    textPrimary:   '#efdee1',
    textSecondary: '#a7898b',
    textMuted:     '#6c5660',

    // Bordures
    border:      '#594142',
    borderLight: '#3c3234',

    // Background
    background:  '#191113',
    surface:     '#261d1f',
    surfaceHigh: '#31282a',
  },
} as const;

// Helper pour obtenir les couleurs selon le mode
export const getColors = (isDarkMode: boolean) => {
  return isDarkMode ? Colors.dark : Colors.light;
};
