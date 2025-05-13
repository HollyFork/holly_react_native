import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

interface BackgroundPatternProps {
  count?: number;
}

export default function BackgroundPattern({ count = 8 }: BackgroundPatternProps) {
  const { isDark } = useThemeColor();
  
  const generateElements = () => {
    const elements = [];
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 6 + 3;
      const isCircle = Math.random() > 0.5;
      const opacity = Math.random() * 0.15 + 0.03;
      
      elements.push(
        <View
          key={i}
          style={[
            styles.element,
            {
              width: size,
              height: size,
              borderRadius: isCircle ? size / 2 : size / 6,
              transform: [
                { rotate: `${Math.random() * 360}deg` },
              ],
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: isDark 
                ? `rgba(255, 255, 255, ${opacity})` 
                : `rgba(0, 0, 0, ${opacity})`,
            },
          ]}
        />
      );
    }
    return elements;
  };

  return (
    <View style={styles.container}>
      {generateElements()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    overflow: 'hidden',
  },
  element: {
    position: 'absolute',
  },
}); 