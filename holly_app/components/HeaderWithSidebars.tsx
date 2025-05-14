import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { usePathname } from 'expo-router';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Restaurant } from '@/src/models';
import { Portal } from '@gorhom/portal';
import { ThemedText } from './ThemedText';
import { CustomIcon } from './CustomIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface HeaderWithSidebarsProps {
  restaurantName: string;
}

// Fonction utilitaire pour convertir un Restaurant en format Sidebar
function convertToSidebarRestaurant(restaurant: Restaurant) {
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
  
  const handleRestaurantSelect = async (sidebarRestaurant: { id: string; name: string }) => {
    const restaurant = restaurants.find(r => r.id_restaurant.toString() === sidebarRestaurant.id);
    if (restaurant) {
      setSelectedRestaurant(restaurant);
      // Rafraîchir les données après le changement de restaurant
      await refreshRestaurants();
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
            <CustomIcon name="apartment" color={colors.primary} size={24} />
          </TouchableOpacity>
          
          <ThemedText type="subtitle" style={styles.title}>
            {restaurantName}
          </ThemedText>
          
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
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 