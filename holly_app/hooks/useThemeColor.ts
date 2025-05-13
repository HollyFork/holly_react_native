/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

export function useThemeColor() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  
  return {
    colors,
    colorScheme,
    isDark: colorScheme === 'dark',
    gradientColors: colorScheme === 'dark'
      ? ['rgba(0,0,0,0.95)', 'rgba(242,126,66,0.6)'] as const
      : ['rgba(255,255,255,0.95)', 'rgba(242,126,66,0.5)'] as const,
  };
}
