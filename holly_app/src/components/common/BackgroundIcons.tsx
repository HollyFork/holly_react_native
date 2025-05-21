import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BackgroundIconsProps {
  count?: number;
}

export default function BackgroundIcons({ count = 5 }: BackgroundIconsProps) {
  const { isDark } = useThemeColor();
  
  const icons = [
    // Fourchette simplifiée
    (size: number, color: string) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 2v6m0 0v12m0-12h-2m2 0h2"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </Svg>
    ),
    // Couteau simplifié
    (size: number, color: string) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M14 2c3 4 4 8 4 12-4 4-8 4-12 4"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </Svg>
    ),
    // Cuillère simplifiée
    (size: number, color: string) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8 4c-2 0-4 2-4 4s2 4 4 4v8"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </Svg>
    ),
    // Assiette simplifiée
    (size: number, color: string) => (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M18 12a6 6 0 11-12 0 6 6 0 0112 0z"
          stroke={color}
          strokeWidth="1"
        />
      </Svg>
    ),
  ];
  
  const generateElements = () => {
    const elements = [];
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 20 + 12;
      const iconIndex = Math.floor(Math.random() * icons.length);
      const opacity = Math.random() * 0.12 + 0.03;
      const rotation = Math.random() * 360;
      
      elements.push(
        <View
          key={i}
          style={[
            styles.element,
            {
              transform: [{ rotate: `${rotation}deg` }],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity,
            },
          ]}
        >
          {icons[iconIndex](
            size,
            isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'
          )}
        </View>
      );
    }
    return elements;
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {generateElements()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  element: {
    position: 'absolute',
  },
}); 