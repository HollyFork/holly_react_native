import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RestaurantIconProps {
  size?: number;
  color?: string;
  bgColor?: string;
}

/**
 * Composant qui affiche une icône de restaurant adaptée pour HollyFork
 */
export default function RestaurantIcon({ 
  size = 50, 
  color = 'white',
  bgColor = '#F27E42'
}: RestaurantIconProps) {
  // Taille relative à la taille globale
  const containerSize = size;
  const iconSize = size * 0.6;
  
  return (
    <View style={[
      styles.container, 
      { 
        width: containerSize, 
        height: containerSize, 
        borderRadius: containerSize / 2,
        backgroundColor: bgColor 
      }
    ]}>
      <MaterialCommunityIcons
        name="silverware-fork-knife"
        size={iconSize}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 