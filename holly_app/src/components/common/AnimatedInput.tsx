import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface AnimatedInputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  bubbleColor?: string;
}

export default function AnimatedInput({ 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry,
  containerStyle,
  bubbleColor,
  style,
  ...props 
}: AnimatedInputProps) {
  const { colors } = useThemeColor();
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(0);

  const bubbleAnim = useAnimatedStyle(() => {
    return {
      transform: [{ 
        scale: withSpring(isFocused ? 1 : 0, {
          damping: 10,
          stiffness: 100,
        })
      }]
    };
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: isFocused ? colors.primary : colors.border,
            color: colors.text,
          },
          style
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      <Animated.View
        style={[
          styles.bubble,
          {
            backgroundColor: bubbleColor || colors.primary,
          },
          bubbleAnim
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 50,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    zIndex: 1,
  },
  bubble: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 0,
    bottom: 8,
    left: 16,
  },
}); 