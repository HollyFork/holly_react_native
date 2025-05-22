import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomIcon } from './CustomIcon';
import { ThemedText } from './ThemedText';

// Ajout de l'interface pour l'orientation
interface Orientation {
  width: number;
  height: number;
  isLandscape: boolean;
}

interface NavItem {
  id: string;
  title: string;
  icon: string;
  route?: string;
  action?: () => void;
  highlight?: boolean;
}

interface NavbarProps {
  isVisible: boolean;
  onClose: () => void;
  currentRoute: string;
}

const { width } = Dimensions.get('window');
const NAVBAR_WIDTH = Math.min(280, width * 0.7);

export function Navbar({ isVisible, onClose, currentRoute }: NavbarProps) {
  // 1. Hooks de contexte et de navigation
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { colors: themeColors, styles: themeStyles } = useThemeColor();

  // 2. Hooks d'état
  const [isRendered, setIsRendered] = useState(isVisible);
  const [orientation, setOrientation] = useState<Orientation>(() => {
    const { width, height } = Dimensions.get('window');
    return {
      width,
      height,
      isLandscape: width > height
    };
  });

  // 3. Hooks de référence
  const isInitialRender = useRef(true);
  const translateX = useSharedValue(isVisible ? 0 : NAVBAR_WIDTH);

  // 4. Hooks d'effet
  useEffect(() => {
    const updateOrientation = () => {
      const { width, height } = Dimensions.get('window');
      setOrientation({
        width,
        height,
        isLandscape: width > height
      });
    };

    const subscription = Dimensions.addEventListener('change', updateOrientation);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isInitialRender.current) {
      translateX.value = isVisible ? 0 : NAVBAR_WIDTH;
      isInitialRender.current = false;
      if (isVisible) {
        setIsRendered(true);
      }
    } else {
      if (isVisible) {
        setIsRendered(true);
      }
      
      translateX.value = withTiming(
        isVisible ? 0 : NAVBAR_WIDTH, 
        { duration: 300 },
        (finished) => {
          if (finished && !isVisible) {
            runOnJS(setIsRendered)(false);
          }
        }
      );
    }
  }, [isVisible, translateX]);

  // 5. Hooks d'animation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  const handleNavigation = (route: string) => {
    onClose();
    // Fermer d'abord la navbar
    setIsRendered(false);
    // Naviguer immédiatement avec le type correct
    router.navigate(route as any);
  };

  const handleLogout = async () => {
    onClose();
    console.log("Navbar: handleLogout appelé. Appel de logout() du AuthContext...");
    
    try {
      await logout();
      console.log("Navbar: logout() du AuthContext terminé.");
      // Redirection vers la page de connexion
      router.replace('/auth/login'); 
    } catch (error) {
      console.error('Navbar: Erreur lors de l\'appel à logout() du AuthContext:', error);
    }
  };

  // Liste des éléments de navigation incluant le bouton de déconnexion
  const navItems: NavItem[] = [
    { id: '1', title: 'Tableau de bord', icon: 'view-dashboard', route: '/(tabs)/dashboard' },
    { id: '2', title: 'Salles', icon: 'office-building', route: '/(tabs)/salles' },
    { id: '3', title: 'Réservations', icon: 'calendar-clock', route: '/(tabs)/reservations' },
    { id: '4', title: 'Commandes', icon: 'cart', route: '/(tabs)/commandes' },
    { id: '5', title: 'Stocks', icon: 'fridge-alert-outline', route: '/(tabs)/stocks' },
    { id: 'notes', title: 'Notes', icon: 'note-text-outline', route: '/(tabs)/notes' },
    { id: '6', title: 'Statistiques', icon: 'chart-bar', route: '/(tabs)/stats' },
    { id: '7', title: 'Paramètres', icon: 'cog', route: '/(tabs)/settings' },
    { id: '8', title: 'Support', icon: 'help-circle', route: '/(tabs)/support' },
    // Séparateur
    { id: 'separator', title: '', icon: '' },
    // Bouton de déconnexion
    { id: 'logout', title: 'Déconnexion', icon: 'logout', action: handleLogout, highlight: true },
  ];
  
  const renderNavItem = ({ item }: { item: NavItem }) => {
    // Si c'est le séparateur, rendre un simple espace
    if (item.id === 'separator') {
      return <View style={styles.separator} />;
    }

    const isActive = item.route === currentRoute;
    const isLogout = item.id === 'logout';
    
    const onPress = () => {
      if (item.action) {
        item.action();
      } else if (item.route) {
        handleNavigation(item.route);
      }
    };
    
    return (
      <TouchableOpacity
        style={[
          styles.navItem,
          isActive && { backgroundColor: colors.primary + '20' },
          isLogout && item.highlight && styles.logoutItem
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <CustomIcon 
          name={item.icon as any} 
          color={isLogout && item.highlight ? colors.primary : isActive ? colors.primary : colors.icon} 
          size={22} 
        />
        <ThemedText 
          style={[
            styles.navItemText, 
            isActive && { color: colors.primary, fontWeight: '600' },
            isLogout && item.highlight && { color: colors.primary, fontWeight: '600' }
          ]}
        >
          {item.title}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  // Calculer les dimensions adaptatives pour le profil utilisateur
  const avatarSize = 40;
  const profilePadding = 8;
  const userNameSize = 14;
  const userRoleSize = 11;
  const avatarMarginBottom = 0;
  const avatarMarginRight = 10;

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
          styles.navbar, 
          { 
            backgroundColor: themeColors.surface,
            paddingTop: insets.top || 40,
            width: NAVBAR_WIDTH,
          },
          animatedStyle
        ]}
      >
        {/* Profile Header */}
        <View style={[
          styles.profileContainer, 
          { 
            padding: profilePadding,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            borderBottomColor: themeColors.border
          }
        ]}>
          <View style={[
            styles.avatarContainer, 
            { 
              width: avatarSize, 
              height: avatarSize, 
              borderRadius: avatarSize/2,
              marginBottom: avatarMarginBottom,
              marginRight: avatarMarginRight,
              backgroundColor: themeColors.card
            }
          ]}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={{ 
                width: avatarSize, 
                height: avatarSize, 
                borderRadius: avatarSize/2 
              }}
            />
          </View>
          <View style={styles.userInfoLandscape}>
            <ThemedText style={[
              styles.userName, 
              { 
                fontSize: userNameSize,
                marginBottom: 4 
              }
            ]}>
              Jean Dupont
            </ThemedText>
            <ThemedText style={[styles.userRole, { fontSize: userRoleSize, color: themeColors.textSecondary }]}>
              Administrateur
            </ThemedText>
          </View>
        </View>
        
        <FlatList
          data={navItems}
          renderItem={renderNavItem}
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
  navbar: {
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  profileContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  avatarContainer: {
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  userRole: {
    opacity: 0.6,
  },
  listContent: {
    padding: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  navItemText: {
    marginLeft: 12,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 8,
  },
  logoutItem: {
    borderWidth: 1,
    borderColor: 'rgba(242, 126, 66, 0.5)',
  },
  userInfoLandscape: {
    alignItems: 'flex-start',
  },
}); 