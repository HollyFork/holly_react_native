import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps, ViewStyle, StyleProp } from 'react-native';

interface AnimatedInputProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  bubbleColor?: string;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
  containerStyle,
  bubbleColor = 'rgba(255, 255, 255, 0.3)',
  style,
  ...props
}) => {
  const renderBubble = (index: number) => (
    <View
      key={index}
      style={[
        styles.bubble,
        {
          backgroundColor: bubbleColor,
          opacity: 0.4,
          left: `${20 + index * 30}%`,
        },
      ]}
    />
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {[0, 1, 2].map((index) => renderBubble(index))}
      <TextInput
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
};

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
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    zIndex: 1,
  },
  bubble: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 0,
    bottom: 8,
  },
});

export default AnimatedInput; 