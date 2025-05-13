import React, { useRef, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, View, Dimensions } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from './ThemedText';
import { CustomIcon } from './CustomIcon';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Restaurant {
  id: string;
  name: string;
}

interface SidebarProps {
  isVisible: boolean;
  restaurants: Restaurant[];
  selectedRestaurantId: string;
  onRestaurantSelect: (restaurant: Restaurant) => void;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(300, width * 0.75);

export function Sidebar({ 
  isVisible, 
  restaurants, 
  selectedRestaurantId,
  onRestaurantSelect, 
  onClose 
}: SidebarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Animation 
  const translateX = useSharedValue(isVisible ? 0 : -SIDEBAR_WIDTH);
  const isInitialRender = useRef(true);

  // État pour suivre si le composant est réellement visible dans l'UI
  const [isRendered, setIsRendered] = React.useState(isVisible);
  
  useEffect(() => {
    if (isInitialRender.current) {
      translateX.value = isVisible ? 0 : -SIDEBAR_WIDTH;
      isInitialRender.current = false;
      if (isVisible) {
        setIsRendered(true);
      }
    } else {
      if (isVisible) {
        setIsRendered(true);
      }
      
      translateX.value = withTiming(
        isVisible ? 0 : -SIDEBAR_WIDTH, 
        { duration: 300 },
        (finished) => {
          if (finished && !isVisible) {
            runOnJS(setIsRendered)(false);
          }
        }
      );
    }
  }, [isVisible, translateX]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  const renderRestaurantItem = ({ item }: { item: Restaurant }) => {
    const isSelected = item.id === selectedRestaurantId;
    
    return (
      <TouchableOpacity
        style={[
          styles.restaurantItem,
          isSelected && { backgroundColor: colors.primary + '20' }
        ]}
        onPress={() => onRestaurantSelect(item)}
        activeOpacity={0.7}
      >
        <CustomIcon 
          name="apartment" 
          color={isSelected ? colors.primary : colors.icon} 
          size={20} 
        />
        <ThemedText style={[styles.restaurantName, isSelected && { color: colors.primary }]}>
          {item.name}
        </ThemedText>
        {isSelected && (
          <CustomIcon 
            name="check" 
            color={colors.primary} 
            size={18} 
          />
        )}
      </TouchableOpacity>
    );
  };

  // Si le composant ne doit pas être rendu, retourner null
  if (!isRendered) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.overlay}
        onPress={onClose}
        activeOpacity={1}
      />
      <Animated.View 
        style={[
          styles.sidebar, 
          { 
            backgroundColor: colors.background,
            paddingTop: insets.top || 40,
            width: SIDEBAR_WIDTH
          },
          animatedStyle
        ]}
      >
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Restaurants
          </ThemedText>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <CustomIcon name="close" color={colors.icon} size={20} />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
  },
  restaurantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  restaurantName: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
  },
}); 