import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Sélection d'icônes utilisées dans l'application
export type IconName = 
  | 'home'
  | 'apartment'
  | 'menu'
  | 'close'
  | 'check'
  | 'dashboard'
  | 'event'
  | 'shopping_bag'
  | 'bar_chart'
  | 'settings'
  | 'help'
  | 'restaurant'
  | 'refresh'
  | 'assessment'
  | 'exit-to-app'
  | 'chevron-right'
  | 'error'
  | 'trending-up'
  | 'warning'
  | 'arrow-upward'
  | 'schedule'
  | 'people'
  | 'phone'
  | 'euro_symbol'
  | 'note'
  | 'add';

interface CustomIconProps {
  name: IconName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}

export function CustomIcon({ name, size = 24, color, style }: CustomIconProps) {
  // Conversion pour certaines icônes qui ont des noms différents
  const iconNameMap: Record<string, string> = {
    'shopping_bag': 'shopping-bag',
    'bar_chart': 'assessment',
    'euro_symbol': 'euro',
    'schedule': 'access-time'
  };

  const iconName = iconNameMap[name] || name;
  
  return <MaterialIcons name={iconName as any} size={size} color={color} style={style} />;
} 