import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { View, type ViewProps } from 'react-native';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'default' | 'card' | 'surface' | 'background';
};

const ThemedView: React.FC<ThemedViewProps> = ({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'default',
  ...otherProps 
}) => {
  const { colors, styles: themeStyles } = useThemeColor(
    { light: lightColor, dark: darkColor },
    variant === 'background' ? 'background' : 
    variant === 'surface' ? 'surface' : 
    variant === 'card' ? 'card' : 'background'
  );

  const getVariantStyle = () => {
    switch (variant) {
      case 'card':
        return themeStyles.card;
      case 'surface':
        return { backgroundColor: colors.surface };
      case 'background':
        return { backgroundColor: colors.background };
      default:
        return {};
    }
  };

  return (
    <View 
      style={[
        getVariantStyle(),
        style
      ]} 
      {...otherProps} 
    />
  );
};

export default ThemedView;
