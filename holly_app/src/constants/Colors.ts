/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.vercel.app/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Palette de couleurs de l'application avec support du mode sombre/clair
 */

// Couleurs de base
const primary = {
  light: '#F27E42',
  dark: '#F27E42',
};

const secondary = {
  light: '#687076',
  dark: '#9BA1A6',
};

const background = {
  light: '#FFFFFF',
  dark: '#151718',
};

const surface = {
  light: '#F8F9FA',
  dark: '#1C1F20',
};

const text = {
  light: '#11181C',
  dark: '#ECEDEE',
};

const error = {
  light: '#FF3B30',
  dark: '#FF453A',
};

const success = {
  light: '#34C759',
  dark: '#32D74B',
};

const warning = {
  light: '#FF9500',
  dark: '#FF9F0A',
};

const info = {
  light: '#0A84FF',
  dark: '#0A84FF',
};

export const Colors = {
  light: {
    // Couleurs principales
    primary: primary.light,
    secondary: secondary.light,
    background: background.light,
    surface: surface.light,
    text: text.light,
    
    // États
    error: error.light,
    success: success.light,
    warning: warning.light,
    info: info.light,
    
    // Éléments d'interface
    tint: primary.light,
    icon: secondary.light,
    tabIconDefault: secondary.light,
    tabIconSelected: primary.light,
    
    // Dégradés
    gradient: ['#FFFFFF', primary.light],
    
    // Variantes
    textSecondary: secondary.light,
    border: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: surface.light,
    cardBorder: 'rgba(0, 0, 0, 0.05)',
  },
  dark: {
    // Couleurs principales
    primary: primary.dark,
    secondary: secondary.dark,
    background: background.dark,
    surface: surface.dark,
    text: text.dark,
    
    // États
    error: error.dark,
    success: success.dark,
    warning: warning.dark,
    info: info.dark,
    
    // Éléments d'interface
    tint: primary.dark,
    icon: secondary.dark,
    tabIconDefault: secondary.dark,
    tabIconSelected: primary.dark,
    
    // Dégradés
    gradient: ['#000000', primary.dark],
    
    // Variantes
    textSecondary: secondary.dark,
    border: 'rgba(255, 255, 255, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    card: surface.dark,
    cardBorder: 'rgba(255, 255, 255, 0.05)',
  },
};
