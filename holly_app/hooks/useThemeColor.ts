/**
 * Hook personnalisé pour gérer les thèmes de l'application
 * Fournit un accès facile aux couleurs et aux états du thème
 */

import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

type ColorKey = keyof typeof Colors.light;

interface ThemeColorProps {
  light?: string;
  dark?: string;
}

export function useThemeColor(props: ThemeColorProps = {}, colorName: ColorKey = 'text') {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'dark'];
  
  // Fonction utilitaire pour obtenir une couleur avec opacité
  const withOpacity = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Obtenir la couleur spécifiée ou la couleur par défaut du thème
  const getColor = (props: ThemeColorProps, colorName: ColorKey) => {
    if (props.light && props.dark) {
      return isDark ? props.dark : props.light;
    }
    return colors[colorName];
  };

  return {
    // Couleurs du thème
    colors,
    colorScheme,
    isDark,
    
    // Couleur actuelle basée sur les props ou le thème
    color: getColor(props, colorName),
    
    // Dégradés
    gradientColors: isDark
      ? ['rgba(0,0,0,0.95)', withOpacity(colors.primary, 0.6)]
      : ['rgba(255,255,255,0.95)', withOpacity(colors.primary, 0.5)],
    
    // Utilitaires
    withOpacity: (color: string, opacity: number) => withOpacity(color, opacity),
    
    // Styles prédéfinis
    styles: {
      card: {
        backgroundColor: colors.card,
        borderColor: colors.cardBorder,
        borderWidth: 1,
        borderRadius: 12,
      },
      text: {
        color: colors.text,
      },
      textSecondary: {
        color: colors.textSecondary,
      },
      border: {
        borderColor: colors.border,
        borderWidth: 1,
      },
    },
  };
}
