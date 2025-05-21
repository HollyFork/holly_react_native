import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MENU_RADIUS = 80; // Rayon réduit pour le menu circulaire
const BUTTON_SIZE = 48; // Taille réduite du bouton
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
          style={[styles.menuItem, menuItemStyle(index)]}
        >
          <TouchableOpacity
            style={styles.menuItemButton}
            onPress={() => {
              item.onPress();
              toggleMenu();
            }}
          >
            <Icon name={item.icon} size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      ))}
      
      <Animated.View style={[styles.mainButton, mainButtonStyle]}>
        <TouchableOpacity
          style={styles.mainButtonInner}
          onPress={toggleMenu}
        >
          <Icon name="menu" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32, // Remis en bas
    right: 32, // Remis à droite
    zIndex: 1000,
  },
  mainButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#F27E42',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    backgroundColor: '#F27E42',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItemButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 