import { PortalProvider } from '@gorhom/portal';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import ThemedView from '@/components/common/ThemedView';
import { AuthProvider } from '@/contexts/AuthContext';
import { RestaurantProvider } from '@/contexts/RestaurantContext';
import { useThemeColor } from '@/hooks/useThemeColor';

// Composant séparé pour le menu flottant
const FloatingMenuWithAuth = () => {
  // Retourne null pour masquer visuellement le menu flottant
  return null;
  
  // Le code existant est commenté pour référence future
  /*
  const router = useRouter();
  const { logout } = useAuth();

  const menuItems = [
    {
      icon: 'restaurant',
      label: 'Restaurants',
      onPress: () => router.push('/(tabs)/explore'),
    },
    {
      icon: 'inventory',
      label: 'Stocks',
      onPress: () => router.push('/(tabs)/stocks'),
    },
    {
      icon: 'logout',
      label: 'Déconnexion',
      onPress: async () => {
        await logout();
        router.push('/auth/login');
      },
    },
  ];

  return <FloatingMenu items={menuItems} />;
  */
};

export default function RootLayout() {
  const { colors, isDark } = useThemeColor();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  // Attendre le chargement des polices
  if (!loaded) {
    return (
      <ThemedView variant="background" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <RestaurantProvider>
            <PortalProvider>
              <ThemedView variant="background" style={{ flex: 1 }}>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: {
                      backgroundColor: colors.background,
                    },
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="auth" options={{ headerShown: false }} />
                </Stack>
                <FloatingMenuWithAuth />
              </ThemedView>
            </PortalProvider>
          </RestaurantProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
