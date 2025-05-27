import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Sélection d'icônes utilisées dans l'application, choisies pour leur ressemblance avec SF Symbols
export type IconName = 
  | 'home'                    // house.fill
  | 'office-building-cog'     // building.2.fill
  | 'office-building'         // building.2
  | 'menu'                    // line.3.horizontal
  | 'close'                   // xmark
  | 'check'                   // checkmark
  | 'view-dashboard'          // square.grid.2x2.fill
  | 'calendar-clock'          // calendar.badge.clock
  | 'cart'                    // cart.fill
  | 'chart-box'               // chart.bar.fill
  | 'cog'                     // gear
  | 'help-circle'             // questionmark.circle.fill
  | 'silverware-fork-knife'   // fork.knife
  | 'refresh'                 // arrow.clockwise
  | 'chart-line'              // chart.line.uptrend.xyaxis
  | 'logout'                  // rectangle.portrait.and.arrow.right
  | 'chevron-right'           // chevron.right
  | 'alert-circle'            // exclamationmark.circle.fill
  | 'trending-up'             // arrow.up.right
  | 'alert'                   // exclamationmark.triangle.fill
  | 'arrow-up'                // arrow.up
  | 'clock-time-four'         // clock.fill
  | 'account-group'           // person.3.fill
  | 'phone'                   // phone.fill
  | 'currency-eur'            // eurosign.circle.fill
  | 'note-text'               // note.text
  | 'plus'                    // plus.circle.fill
  | 'fridge-alert-outline'    // fridge.alert.outline
  | 'pencil-outline'          // pencil.outline
  | 'delete-outline';         // delete.outline

interface CustomIconProps {
  name: IconName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}

export function CustomIcon({ name, size = 24, color, style }: CustomIconProps) {
  // Conversion pour certaines icônes qui ont des noms différents
  const iconNameMap: Record<string, string> = {
    'shopping_bag': 'cart',
    'bar_chart': 'chart-box',
    'euro_symbol': 'currency-eur',
    'schedule': 'clock-time-four',
    'apartment': 'office-building-cog',
    'building': 'office-building',
    'dashboard': 'view-dashboard',
    'event': 'calendar-clock',
    'assessment': 'chart-line',
    'exit-to-app': 'logout',
    'error': 'alert-circle',
    'warning': 'alert',
    'arrow-upward': 'arrow-up',
    'people': 'account-group',
    'note': 'note-text',
    'add': 'plus',
    'restaurant': 'silverware-fork-knife',
    'category': 'fridge-alert-outline',
    'edit': 'pencil-outline',
    'delete': 'delete-outline'
  };

  const iconName = iconNameMap[name] || name;
  
  return <MaterialCommunityIcons name={iconName as any} size={size} color={color} style={style} />;
} 