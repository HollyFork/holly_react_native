import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'secondary';
  variant?: 'default' | 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'info';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  variant = 'default',
  ...rest
}: ThemedTextProps) {
  const { colors, styles: themeStyles } = useThemeColor(
    { light: lightColor, dark: darkColor },
    variant === 'primary' ? 'primary' :
    variant === 'secondary' ? 'secondary' :
    variant === 'error' ? 'error' :
    variant === 'success' ? 'success' :
    variant === 'warning' ? 'warning' :
    variant === 'info' ? 'info' : 'text'
  );

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { color: colors.primary };
      case 'secondary':
        return themeStyles.textSecondary;
      case 'error':
        return { color: colors.error };
      case 'success':
        return { color: colors.success };
      case 'warning':
        return { color: colors.warning };
      case 'info':
        return { color: colors.info };
      default:
        return themeStyles.text;
    }
  };

  return (
    <Text
      style={[
        getVariantStyle(),
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
