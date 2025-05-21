import { CustomIcon } from '@/components/common/CustomIcon';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';
import { ThemedText } from '@/components/common/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { Restaurant } from '@/models/Restaurant';
import { Portal } from '@gorhom/portal';
import { router, usePathname } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderWithSidebarsProps {
  restaurantName: string;
}

// Interface pour le format de restaurant attendu par le Sidebar
interface SidebarRestaurant {
  id: string;
  name: string;
}

// Fonction utilitaire pour convertir un Restaurant en format Sidebar
function convertToSidebarRestaurant(restaurant: Restaurant): SidebarRestaurant {
  return {
    id: restaurant.id_restaurant.toString(),
    name: restaurant.nom_restaurant
  };
}

export function HeaderWithSidebars({ restaurantName }: HeaderWithSidebarsProps) {
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const { 
    restaurants,
    selectedRestaurant,
    setSelectedRestaurant,
    refreshRestaurants
  } = useRestaurants();
  
  // État pour gérer l'ouverture/fermeture de la sidebar et navbar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  
  // Conversion des restaurants pour le composant Sidebar
  const sidebarRestaurants = restaurants.map(convertToSidebarRestaurant);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (isNavbarOpen) setIsNavbarOpen(false);
  };
  
  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  const handleTitlePress = () => {
    if (pathname !== '/(tabs)/dashboard') {
      router.push('/(tabs)/dashboard');
    }
  };
  
  const handleRestaurantSelect = (sidebarRestaurant: SidebarRestaurant) => {
    const restaurant = restaurants.find((r: Restaurant) => r.id_restaurant.toString() === sidebarRestaurant.id);
    if (restaurant && restaurant.id_restaurant !== selectedRestaurant?.id_restaurant) {
      setSelectedRestaurant(restaurant);
      // Ne rafraîchir que si nécessaire
      if (restaurants.length === 0) {
        refreshRestaurants();
      }
    }
    setIsSidebarOpen(false);
  };

  return (
    <>
      <View style={styles.headerWrapper}>
        <View 
          style={[
            styles.header, 
            { 
              backgroundColor: colors.background,
              paddingTop: insets.top || 40
            }
          ]}
        >
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleSidebar}
            activeOpacity={0.7}
          >
            <CustomIcon name="office-building-cog" color={colors.primary} size={24} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={handleTitlePress}
            activeOpacity={0.7}
          >
            <ThemedText type="subtitle" style={[styles.title, { color: colors.primary }]}>
              {restaurantName}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleNavbar}
            activeOpacity={0.7}
          >
            <CustomIcon name="menu" color={colors.primary} size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <Portal>
        <Sidebar 
          isVisible={isSidebarOpen}
          restaurants={sidebarRestaurants}
          selectedRestaurantId={selectedRestaurant?.id_restaurant.toString() || ''}
          onRestaurantSelect={handleRestaurantSelect}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <Navbar 
          isVisible={isNavbarOpen}
          onClose={() => setIsNavbarOpen(false)}
          currentRoute={pathname}
        />
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 