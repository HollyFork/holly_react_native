import { Colors } from '@/constants/Colors';
import { Restaurant as RestaurantModel } from '@/models/Restaurant';
import { restaurantService } from '@/services/entities/restaurantService';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RestaurantModal } from '../restaurants/RestaurantModal';
import { CustomIcon } from './CustomIcon';
import { ThemedText } from './ThemedText';

interface SidebarRestaurant {
  id: string;
  name: string;
}

interface SidebarProps {
  isVisible: boolean;
  restaurants: SidebarRestaurant[];
  selectedRestaurantId: string;
  onRestaurantSelect: (restaurant: SidebarRestaurant) => void;
  onClose: () => void;
  onRestaurantsChange: () => void;
}

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = Math.min(300, width * 0.75);

export function Sidebar({ 
  isVisible, 
  restaurants, 
  selectedRestaurantId,
  onRestaurantSelect, 
  onClose,
  onRestaurantsChange
}: SidebarProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Animation 
  const translateX = useSharedValue(isVisible ? 0 : -SIDEBAR_WIDTH);
  const isInitialRender = useRef(true);

  // État pour suivre si le composant est réellement visible dans l'UI
  const [isRendered, setIsRendered] = React.useState(isVisible);
  
  // État pour le modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantModel | undefined>();

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

  const handleCreateRestaurant = () => {
    setModalMode('create');
    setSelectedRestaurant(undefined);
    setModalVisible(true);
  };

  const handleEditRestaurant = async (restaurant: SidebarRestaurant) => {
    try {
      const restaurantData = await restaurantService.getById(parseInt(restaurant.id));
      setModalMode('edit');
      setSelectedRestaurant(restaurantData.data);
      setModalVisible(true);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du restaurant:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les détails du restaurant');
    }
  };

  const handleDeleteRestaurant = async (restaurant: SidebarRestaurant) => {
    Alert.alert(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer le restaurant "${restaurant.name}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await restaurantService.remove(parseInt(restaurant.id));
              onRestaurantsChange();
              if (restaurant.id === selectedRestaurantId) {
                // Si le restaurant supprimé était sélectionné, sélectionner le premier restaurant disponible
                const remainingRestaurants = restaurants.filter(r => r.id !== restaurant.id);
                if (remainingRestaurants.length > 0) {
                  onRestaurantSelect(remainingRestaurants[0]);
                }
              }
            } catch (error) {
              console.error('Erreur lors de la suppression du restaurant:', error);
              Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression du restaurant');
            }
          },
        },
      ]
    );
  };
  
  const renderRestaurantItem = ({ item }: { item: SidebarRestaurant }) => {
    const isSelected = item.id === selectedRestaurantId;
    
    return (
      <View style={styles.restaurantItemContainer}>
        <TouchableOpacity
          style={[
            styles.restaurantItem,
            isSelected && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => onRestaurantSelect(item)}
          activeOpacity={0.7}
        >
          <CustomIcon 
            name="office-building-cog" 
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

        <View style={styles.restaurantActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditRestaurant(item)}
          >
            <MaterialCommunityIcons name="pencil-outline" color={colors.icon} size={16} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteRestaurant(item)}
          >
            <MaterialCommunityIcons name="delete-outline" color={colors.error} size={16} />
          </TouchableOpacity>
        </View>
      </View>
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
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleCreateRestaurant}
            >
              <CustomIcon name="plus" color={colors.primary} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <CustomIcon name="close" color={colors.icon} size={20} />
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        <RestaurantModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          restaurant={selectedRestaurant}
          mode={modalMode}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
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
  restaurantItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  restaurantName: {
    marginLeft: 12,
    flex: 1,
    fontSize: 16,
  },
  restaurantActions: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
}); 