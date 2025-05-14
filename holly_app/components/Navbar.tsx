import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, FlatList, Image } from 'react-native';
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
import { useRouter } from 'expo-router';
import { authService } from '@/src/services/auth/authService';

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
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
  
  // Gestion de l'orientation
  const [orientation, setOrientation] = useState<Orientation>(() => {
    const { width, height } = Dimensions.get('window');
    return {
      width,
      height,
      isLandscape: width > height
    };
  });

  // Mettre à jour l'orientation quand les dimensions de l'écran changent
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
  
  // Animation
  const translateX = useSharedValue(isVisible ? 0 : NAVBAR_WIDTH);
  const isInitialRender = useRef(true);
  
  // État pour suivre si le composant est réellement visible dans l'UI
  const [isRendered, setIsRendered] = React.useState(isVisible);
  
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
    
    try {
      // Appeler le service de déconnexion
      await authService.logout();
      
      // Rediriger vers la page de connexion après un court délai
      setTimeout(() => {
        router.replace('/auth/login');
      }, 300);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Forcer la redirection même en cas d'erreur
      setTimeout(() => {
        router.replace('/auth/login');
      }, 300);
    }
  };

  // Liste des éléments de navigation incluant le bouton de déconnexion
  const navItems: NavItem[] = [
    { id: '1', title: 'Tableau de bord', icon: 'view-dashboard', route: '/(tabs)/dashboard' },
    { id: '2', title: 'Réservations', icon: 'calendar-clock', route: '/(tabs)/reservations' },
    { id: '3', title: 'Commandes', icon: 'cart', route: '/(tabs)/commandes' },
    { id: '4', title: 'Stocks', icon: 'fridge-alert-outline', route: '/(tabs)/stocks' },
    { id: '5', title: 'Statistiques', icon: 'chart-bar', route: '/(tabs)/stats' },
    { id: '6', title: 'Paramètres', icon: 'cog', route: '/(tabs)/settings' },
    { id: '7', title: 'Support', icon: 'help-circle', route: '/(tabs)/support' },
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

  // Si le composant ne doit pas être rendu, retourner null
  if (!isRendered) {
    return null;
  }

  // Calculer les dimensions adaptatives pour le profil utilisateur
  const avatarSize = orientation.isLandscape ? 40 : 80;
  const profilePadding = orientation.isLandscape ? 8 : 20;
  const userNameSize = orientation.isLandscape ? 14 : 18;
  const userRoleSize = orientation.isLandscape ? 11 : 14;
  const avatarMarginBottom = orientation.isLandscape ? 0 : 12;
  const avatarMarginRight = orientation.isLandscape ? 10 : 0;

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
            backgroundColor: colors.background,
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
            flexDirection: orientation.isLandscape ? 'row' : 'column',
            justifyContent: orientation.isLandscape ? 'flex-start' : 'center',
            alignItems: orientation.isLandscape ? 'center' : 'center',
          }
        ]}>
          <View style={[
            styles.avatarContainer, 
            { 
              width: avatarSize, 
              height: avatarSize, 
              borderRadius: avatarSize/2,
              marginBottom: avatarMarginBottom,
              marginRight: avatarMarginRight
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
          <View style={orientation.isLandscape ? styles.userInfoLandscape : {}}>
            <ThemedText style={[
              styles.userName, 
              { 
                fontSize: userNameSize,
                marginBottom: orientation.isLandscape ? 1 : 4 
              }
            ]}>
              Jean Dupont
            </ThemedText>
            <ThemedText style={[styles.userRole, { fontSize: userRoleSize }]}>
              Administrateur
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Menu
          </ThemedText>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <CustomIcon name="close" color={colors.icon} size={20} />
          </TouchableOpacity>
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
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
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