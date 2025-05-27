import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View, ViewStyle, useColorScheme } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MENU_RADIUS = 80; // Rayon réduit pour le menu circulaire
const BUTTON_SIZE = 44; // Modifié pour correspondre au bouton d'ajout
const START_ANGLE = Math.PI; // Commence à gauche (π radians)
const END_ANGLE = Math.PI * 1.5; // Se termine en haut (1.5π radians)

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
}

interface FloatingMenuProps {
  items: MenuItem[];
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useSharedValue(0);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    animation.value = withSpring(isOpen ? 0 : 1, {
      damping: 15,
      stiffness: 120,
    });
  };

  const mainButtonStyle = useAnimatedStyle<ViewStyle>(() => {
    return {
      transform: [
        {
          rotate: `${interpolate(animation.value, [0, 1], [0, -90])}deg`,
        },
      ],
    };
  });

  const menuItemStyle = (index: number) => {
    // Calculer l'angle pour chaque élément dans le quart de cercle
    const angleStep = (END_ANGLE - START_ANGLE) / (items.length - 1);
    const angle = START_ANGLE + (index * angleStep);
    const x = Math.cos(angle) * MENU_RADIUS;
    const y = Math.sin(angle) * MENU_RADIUS;

    return useAnimatedStyle<ViewStyle>(() => {
      return {
        transform: [
          {
            translateX: interpolate(animation.value, [0, 1], [0, x]),
          },
          {
            translateY: interpolate(animation.value, [0, 1], [0, y]),
          },
          {
            scale: interpolate(animation.value, [0, 1], [0, 1]),
          },
        ],
        opacity: animation.value,
      };
    });
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <Animated.View
          key={item.label}
          style={[
            styles.menuItem,
            { backgroundColor: colors.primary },
            menuItemStyle(index)
          ]}
        >
          <TouchableOpacity
            style={styles.menuItemButton}
            onPress={() => {
              item.onPress();
              toggleMenu();
            }}
          >
            <Icon name={item.icon} size={22} color={colors.surface} />
          </TouchableOpacity>
        </Animated.View>
      ))}
      
      <Animated.View style={[
        styles.mainButton,
        { backgroundColor: colors.primary },
        mainButtonStyle
      ]}>
        <TouchableOpacity
          style={styles.mainButtonInner}
          onPress={toggleMenu}
        >
          <Icon name="menu" size={22} color={colors.surface} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32, // Augmenté de 32 à 64 pour descendre le menu
    right: 30, // Remis à droite
    zIndex: 1000,
  },
  mainButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  mainButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItem: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  menuItemButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 